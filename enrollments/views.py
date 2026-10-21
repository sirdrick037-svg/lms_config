from django.shortcuts import render
from django.utils import timezone
from rest_framework import generics, serializers
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from .models import Enrollment, LessonProgress
from .serializers import EnrollmentSerializer, LessonProgressSerializer
# Create your views here.
class EnrollmentListCreateView(generics.ListCreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(
            student=self.request.user
        ).select_related("course", "student")

    def perform_create(self, serializer):
        course = serializer.validated_data["course"]

        if self.request.user.role != "STUDENT":
            raise ValidationError("Only students can enroll in courses.")

        if not course.is_published:
            raise ValidationError("You can only enroll in published courses.")

        serializer.save(student=self.request.user)


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
        enrollment = serializer.validated_data.get("enrollment")
        lesson = serializer.validated_data["lesson"]

        if enrollment is None:
            raise ValidationError("An enrollment is required.")

        if enrollment.student_id != self.request.user.id:
            raise ValidationError("You cannot use another student's enrollment.")

        if enrollment.course_id != lesson.course_id:
            raise ValidationError(
                "The lesson must belong to your enrolled course."
            )

        serializer.save(
            enrollment=enrollment,
            completed_at=timezone.now(),
        )


class LessonProgressListCreateView(generics.ListCreateAPIView):
    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LessonProgress.objects.filter(
            enrollment__student=self.request.user
        ).select_related("enrollment", "lesson", "lesson__course")

    def perform_create(self, serializer):
        enrollment = serializer.validated_data["enrollment"]
        lesson = serializer.validated_data["lesson"]

        # Only allow progress for the logged-in student's enrollment.
        if enrollment.student_id != self.request.user.id:
            raise PermissionDenied(
                "You can only track progress for your own enrollments."
            )

        # The lesson must belong to the enrolled course.
        if enrollment.course_id != lesson.course_id:
            raise PermissionDenied(
                "This lesson does not belong to your enrolled course."
            )

        # Prevent duplicate progress records for the same lesson.
        if LessonProgress.objects.filter(
            enrollment=enrollment,
            lesson=lesson,
        ).exists():
            raise serializers.ValidationError(
                {"lesson": "A progress record already exists for this lesson."}
            )

        is_completed = serializer.validated_data.get(
            "is_completed", False
        )

        serializer.save(
            completed_at=timezone.now() if is_completed else None
        )
