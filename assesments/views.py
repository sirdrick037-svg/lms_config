
from django.db import transaction
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Quiz, Question, QuizAttempt, Answer
from .serializers import QuizSerializer, QuestionSerializer, QuizAttemptSerializer
# Create your views here.

class QuizListCreateView(generics.ListCreateAPIView):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Quiz.objects.select_related(
            "course", "course__instructor"
        ).prefetch_related("questions")

        user = self.request.user

        if user.is_staff:
            return queryset

        if user.role == "INSTRUCTOR":
            return queryset.filter(course__instructor=user)

        return queryset.filter(is_published=True, course__is_published=True)

    def perform_create(self, serializer):
        course = serializer.validated_data["course"]

        if (
            self.request.user.role != "INSTRUCTOR"
            or course.instructor_id != self.request.user.id
        ):
            raise PermissionDenied(
                "You can only create quizzes for your own courses."
            )

        serializer.save()


class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Quiz.objects.select_related(
            "course", "course__instructor"
        ).prefetch_related("questions")

        if user.is_staff:
            return queryset

        if user.role == "INSTRUCTOR":
            return queryset.filter(course__instructor=user)

        return queryset.filter(is_published=True, course__is_published=True)

    def _check_instructor(self):
        quiz = self.get_object()

        if (
            not self.request.user.is_staff
            and (
                self.request.user.role != "INSTRUCTOR"
                or quiz.course.instructor_id != self.request.user.id
            )
        ):
            raise PermissionDenied(
                "Only the course instructor can modify this quiz."
            )

    def update(self, request, *args, **kwargs):
        self._check_instructor()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._check_instructor()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._check_instructor()
        return super().destroy(request, *args, **kwargs)


class QuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Question.objects.filter(
            quiz_id=self.kwargs["quiz_id"]
        ).select_related("quiz", "quiz__course")

    def perform_create(self, serializer):
        quiz = generics.get_object_or_404(
            Quiz, pk=self.kwargs["quiz_id"]
        )

        if (
            self.request.user.role != "INSTRUCTOR"
            or quiz.course.instructor_id != self.request.user.id
        ):
            raise PermissionDenied(
                "You can only add questions to your own quizzes."
            )

        serializer.save(quiz=quiz)


class QuizAttemptListCreateView(generics.ListCreateAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(
            student=self.request.user
        ).select_related("quiz")

    def perform_create(self, serializer):
        quiz = serializer.validated_data["quiz"]

        if self.request.user.role != "STUDENT":
            raise PermissionDenied("Only students can attempt quizzes.")

        if not quiz.is_published or not quiz.course.is_published:
            raise ValidationError("This quiz is not available.")

        from enrollments.models import Enrollment

        if not Enrollment.objects.filter(
            student=self.request.user,
            course=quiz.course,
        ).exists():
            raise PermissionDenied(
                "You must enroll in this course before attempting its quiz."
            )

        serializer.save(student=self.request.user)


class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, attempt_id):
        try:
            attempt = QuizAttempt.objects.select_for_update().get(
                pk=attempt_id,
                student=request.user,
            )
        except QuizAttempt.DoesNotExist:
            return Response(
                {"detail": "Quiz attempt not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if attempt.submitted_at is not None:
            raise ValidationError("This quiz attempt has already been submitted.")

        answers_data = request.data.get("answers")

        if not isinstance(answers_data, list) or not answers_data:
            raise ValidationError(
                {"answers": "Provide a non-empty list of answers."}
            )

        questions = {
            question.id: question
            for question in Question.objects.filter(quiz=attempt.quiz)
        }

        seen_question_ids = set()
        correct_count = 0

        for item in answers_data:
            if not isinstance(item, dict):
                raise ValidationError("Each answer must be an object.")

            question_id = item.get("question")
            selected_answer = item.get("selected_answer")

            if question_id not in questions:
                raise ValidationError(
                    "Every question must belong to this quiz."
                )

            if question_id in seen_question_ids:
                raise ValidationError(
                    "A question can only be answered once per attempt."
                )

            if selected_answer not in {"A", "B", "C", "D"}:
                raise ValidationError(
                    "selected_answer must be A, B, C, or D."
                )

            seen_question_ids.add(question_id)
            question = questions[question_id]
            is_correct = selected_answer == question.correct_answer
            correct_count += int(is_correct)

            Answer.objects.create(
                attempt=attempt,
                question=question,
                selected_answer=selected_answer,
                is_correct=is_correct,
            )

        total_questions = len(questions)

        if total_questions == 0:
            raise ValidationError("This quiz has no questions.")

        attempt.score = round(correct_count * 100 / total_questions)
        attempt.passed = attempt.score >= attempt.quiz.passing_score
        attempt.submitted_at = timezone.now()
        attempt.save(
            update_fields=["score", "passed", "submitted_at"]
        )

        return Response(
            QuizAttemptSerializer(attempt).data,
            status=status.HTTP_200_OK,
        )
