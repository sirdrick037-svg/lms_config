from django.shortcuts import render
from django.utils import timezone
from rest_framework import generics
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
