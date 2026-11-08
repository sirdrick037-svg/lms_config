
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone

from drf_spectacular.utils import extend_schema

from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Quiz, Question, QuizAttempt, Answer

from .serializers import (
    QuizSerializer,
    QuestionSerializer,
    QuizAttemptSerializer,
    QuestionWriteSerializer,
    QuizReviewSerializer,
)

from courses.models import Lesson
from enrollments.models import Enrollment, LessonProgress


# --------------------------------------------------
# QUIZ LIST AND CREATE
# --------------------------------------------------

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

        return queryset.filter(
            is_published=True,
            course__is_published=True
        )

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data["course"]

        if user.is_staff:
            serializer.save()
            return

        if (
            user.role != "INSTRUCTOR"
            or course.instructor_id != user.id
        ):
            raise PermissionDenied(
                "You can only create quizzes for your own courses."
            )

        serializer.save()


# --------------------------------------------------
# QUIZ DETAIL, UPDATE AND DELETE
# --------------------------------------------------

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

        return queryset.filter(
            is_published=True,
            course__is_published=True
        )

    def _check_instructor(self):
        quiz = self.get_object()
        user = self.request.user

        if user.is_staff:
            return

        if (
            user.role != "INSTRUCTOR"
            or quiz.course.instructor_id != user.id
        ):
            raise PermissionDenied(
                "Only the course instructor or administrator can modify this quiz."
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


# --------------------------------------------------
# QUESTION LIST AND CREATE
# --------------------------------------------------

class QuestionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = Question.objects.filter(
            quiz_id=self.kwargs["quiz_id"]
        ).select_related("quiz", "quiz__course")

        if user.is_staff:
            return queryset

        if user.role == "INSTRUCTOR":
            return queryset.filter(
                quiz__course__instructor=user
            )

        return queryset.filter(
            quiz__is_published=True,
            quiz__course__is_published=True
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return QuestionWriteSerializer

        return QuestionSerializer

    def perform_create(self, serializer):
        user = self.request.user

        quiz = get_object_or_404(
            Quiz,
            pk=self.kwargs["quiz_id"]
        )

        if user.is_staff:
            serializer.save(quiz=quiz)
            return

        if (
            user.role != "INSTRUCTOR"
            or quiz.course.instructor_id != user.id
        ):
            raise PermissionDenied(
                "You can only add questions to your own quizzes."
            )

        serializer.save(quiz=quiz)


# --------------------------------------------------
# STUDENT QUIZ ATTEMPTS
# --------------------------------------------------

class QuizAttemptListCreateView(generics.ListCreateAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(
            student=self.request.user
        ).select_related("quiz")

    def perform_create(self, serializer):
        user = self.request.user
        quiz = serializer.validated_data["quiz"]

        if user.role != "STUDENT":
            raise PermissionDenied(
                "Only students can attempt quizzes."
            )

        if not quiz.is_published or not quiz.course.is_published:
            raise ValidationError(
                "This quiz is not available."
            )

        enrollment = Enrollment.objects.filter(
            student=user,
            course=quiz.course
        ).first()

        if not enrollment:
            raise PermissionDenied(
                "You must enroll in this course before attempting its quiz."
            )

        # Students can start before completing lessons.
        # Completion is checked when they submit.

        serializer.save(student=user)


# --------------------------------------------------
# SUBMIT QUIZ
# --------------------------------------------------

class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, attempt_id):

        try:
            attempt = QuizAttempt.objects.select_for_update().get(
                pk=attempt_id,
                student=request.user
            )

        except QuizAttempt.DoesNotExist:
            return Response(
                {"detail": "Quiz attempt not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user.role != "STUDENT":
            raise PermissionDenied(
                "Only students can submit quiz attempts."
            )

        if attempt.submitted_at is not None:
            raise ValidationError(
                "This quiz attempt has already been submitted."
            )

        # Check enrollment.
        enrollment = Enrollment.objects.filter(
            student=request.user,
            course=attempt.quiz.course
        ).first()

        if not enrollment:
            raise PermissionDenied(
                "You must be enrolled in this course."
            )

        # Check lesson completion.
        total_lessons = Lesson.objects.filter(
            course=attempt.quiz.course
        ).count()

        completed_lessons = LessonProgress.objects.filter(
            enrollment=enrollment,
            lesson__course=attempt.quiz.course,
            is_completed=True
        ).count()

        if total_lessons == 0:
            raise ValidationError(
                "This course has no lessons available yet."
            )

        if completed_lessons < total_lessons:
            remaining = total_lessons - completed_lessons

            raise PermissionDenied(
                f"You must complete all lessons before submitting. "
                f"{remaining} lesson(s) remaining."
            )

        answers_data = request.data.get("answers")

        if not isinstance(answers_data, list) or not answers_data:
            raise ValidationError(
                {"answers": "Provide a non-empty list of answers."}
            )

        questions = {
            question.id: question
            for question in Question.objects.filter(
                quiz=attempt.quiz
            )
        }

        seen_question_ids = set()
        correct_count = 0

        for item in answers_data:

            if not isinstance(item, dict):
                raise ValidationError(
                    "Each answer must be an object."
                )

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

            is_correct = (
                selected_answer == question.correct_answer
            )

            correct_count += int(is_correct)

            Answer.objects.create(
                attempt=attempt,
                question=question,
                selected_answer=selected_answer,
                is_correct=is_correct
            )

        total_questions = len(questions)

        if total_questions == 0:
            raise ValidationError(
                "This quiz has no questions."
            )

        # Calculate score automatically.
        attempt.score = round(
            correct_count * 100 / total_questions
        )

        # Wait for admin or instructor review.
        attempt.passed = False
        attempt.review_status = "PENDING"

        attempt.submitted_at = timezone.now()

        attempt.save(
            update_fields=[
                "score",
                "passed",
                "review_status",
                "submitted_at"
            ]
        )

        return Response(
            QuizAttemptSerializer(attempt).data,
            status=status.HTTP_200_OK
        )


# --------------------------------------------------
# ADMIN AND INSTRUCTOR: VIEW SUBMITTED QUIZZES
# --------------------------------------------------

class QuizSubmissionReviewListView(generics.ListAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            queryset = QuizAttempt.objects.all()

        elif user.role == "INSTRUCTOR":
            queryset = QuizAttempt.objects.filter(
                quiz__course__instructor=user
            )

        else:
            raise PermissionDenied(
                "Only instructors and administrators can review quizzes."
            )

        return queryset.filter(
            submitted_at__isnull=False
        ).select_related(
            "student",
            "quiz",
            "quiz__course",
            "reviewed_by"
        ).prefetch_related("answers")


# --------------------------------------------------
# ADMIN AND INSTRUCTOR: PASS OR FAIL A QUIZ
# --------------------------------------------------

class ReviewQuizAttemptView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=QuizReviewSerializer,
        responses=QuizAttemptSerializer
    )
    def patch(self, request, attempt_id):
        user = request.user

        if not user.is_staff and user.role != "INSTRUCTOR":
            raise PermissionDenied(
                "Only instructors and administrators can review quizzes."
            )

        attempt = get_object_or_404(
            QuizAttempt.objects.select_related(
                "quiz__course",
                "student"
            ),
            pk=attempt_id,
            submitted_at__isnull=False
        )

        # Instructors can only review their own courses.
        if (
            not user.is_staff
            and attempt.quiz.course.instructor_id != user.id
        ):
            raise PermissionDenied(
                "You can only review quizzes from your own courses."
            )

        # Prevent reviewing an attempt more than once.
        if attempt.review_status != "PENDING":
            raise ValidationError(
                "This quiz has already been reviewed."
            )

        # Validate the review decision.
        review_serializer = QuizReviewSerializer(
            data=request.data
        )
        review_serializer.is_valid(raise_exception=True)

        decision = review_serializer.validated_data["review_status"]

        # Save the review.
        attempt.review_status = decision
        attempt.passed = decision == "PASS"
        attempt.reviewed_by = user
        attempt.reviewed_at = timezone.now()

        attempt.save(
            update_fields=[
                "review_status",
                "passed",
                "reviewed_by",
                "reviewed_at"
            ]
        )

        return Response(
            QuizAttemptSerializer(attempt).data,
            status=status.HTTP_200_OK
        )
