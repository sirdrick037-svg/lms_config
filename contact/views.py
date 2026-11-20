
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import ContactMessage, InstructorMessage
from .serializers import ContactMessageSerializer, InstructorMessageSerializer
from courses.models import Course
from enrollments.models import Enrollment


# Public: Visitors can submit contact messages.
class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]


# Admin: View all submitted contact messages.
class ContactMessageListView(generics.ListAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAdminUser]


# Student: Send a message to an instructor of an enrolled course.
class InstructorMessageCreateView(generics.CreateAPIView):
    serializer_class = InstructorMessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != "STUDENT":
            raise PermissionDenied(
                "Only students can send messages to instructors."
            )

        course_id = self.request.data.get("course")
        instructor_id = self.request.data.get("instructor")

        if not course_id or not instructor_id:
            raise ValidationError(
                "Please select a course and instructor."
            )

        course = generics.get_object_or_404(
            Course.objects.prefetch_related("instructors"),
            pk=course_id,
        )

        enrolled = Enrollment.objects.filter(
            student=user,
            course=course,
        ).exists()

        if not enrolled:
            raise PermissionDenied(
                "You must be enrolled in this course to contact its instructor."
            )

        assigned = course.instructors.filter(
            id=instructor_id,
            role="INSTRUCTOR",
        ).exists()

        if course.instructor_id == int(instructor_id):
            assigned = True

        if not assigned:
            raise PermissionDenied(
                "This instructor is not assigned to the selected course."
            )

        serializer.save(
            student=user,
            course=course,
            instructor_id=instructor_id,
        )


# Instructor: View messages sent to them.
class InstructorMessageListView(generics.ListAPIView):
    serializer_class = InstructorMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role != "INSTRUCTOR":
            raise PermissionDenied(
                "Only instructors can view instructor messages."
            )

        return InstructorMessage.objects.filter(
            instructor=user
        ).select_related("student", "instructor", "course")
