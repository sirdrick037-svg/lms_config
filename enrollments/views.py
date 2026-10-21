
from django.utils import timezone

from rest_framework import generics, serializers
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import Enrollment, LessonProgress
from .serializers import EnrollmentSerializer, LessonProgressSerializer


class EnrollmentListCreateView(generics.ListCreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(
            student=self.request.user
        ).select_related("course", "student")

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data["course"]

        if user.role != "STUDENT":
            raise PermissionDenied(
                "Only students can enroll in courses."
            )

        if not course.is_published:
            raise ValidationError(
                "You can only enroll in published courses."
            )

        if Enrollment.objects.filter(
            student=user, course=course
        ).exists():
            raise ValidationError(
                {"course": "You are already enrolled in this course."}
            )

        serializer.save(student=user)


class EnrollmentDetailView(generics.RetrieveAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(
            student=self.request.user
        ).select_related("course", "student")


class LessonProgressListCreateView(generics.ListCreateAPIView):
    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LessonProgress.objects.filter(
            enrollment__student=self.request.user
        ).select_related("enrollment", "lesson", "lesson__course")

    def perform_create(self, serializer):
        user = self.request.user
        enrollment = serializer.validated_data["enrollment"]
        lesson = serializer.validated_data["lesson"]
        is_completed = serializer.validated_data.get(
            "is_completed", False
        )

        if user.role != "STUDENT":
            raise PermissionDenied(
                "Only students can track lesson progress."
            )

        if enrollment.student_id != user.id:
            raise PermissionDenied(
                "You can only track progress for your own enrollments."
            )

        if enrollment.course_id != lesson.course_id:
            raise ValidationError(
                {"lesson": "The lesson must belong to your enrolled course."}
            )

        if LessonProgress.objects.filter(
            enrollment=enrollment, lesson=lesson
        ).exists():
            raise ValidationError(
                {"lesson": "A progress record already exists for this lesson."}
            )

        serializer.save(
            completed_at=timezone.now() if is_completed else None
        )


class LessonProgressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LessonProgress.objects.filter(
            enrollment__student=self.request.user
        ).select_related("enrollment", "lesson", "lesson__course")

    def perform_update(self, serializer):
        is_completed = serializer.validated_data.get(
            "is_completed",
            serializer.instance.is_completed,
        )

        if is_completed and not serializer.instance.is_completed:
            completed_at = timezone.now()
        elif not is_completed:
            completed_at = None
        else:
            completed_at = serializer.instance.completed_at

        serializer.save(completed_at=completed_at)
