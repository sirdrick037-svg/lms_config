from django.shortcuts import render

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.expectations import PermissionDenied

from .models import Course, Lesson
from .serializers import CourseSerializer, LessonSerializer

# Create your views here.
class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.select_related("instructor").all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != "INSTRUCTOR":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "Only instructors can create courses."
            )

        serializer.save(instructor=self.request.user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.select_related("instructor").all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            from rest_framework.permissions import IsAdminUser
            return [IsAuthenticated(), IsAdminUser()]
        return super().get_permissions()

    
class LessonListCreateView(generics.ListCreateAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Lesson.objects.select_related("course").all()

    def perform_create(self, serializer):
        course = serializer.validated_data["course"]

        if (
            self.request.user.role != "INSTRUCTOR"
            or course.instructor_id != self.request.user.id
        ):
            raise PermissionDenied(
                "You can only add lessons to your own courses."
            )

        serializer.save()


class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Lesson.objects.select_related("course").all()

    def _check_course_instructor(self):
        lesson = self.get_object()

        if (
            self.request.user.role != "INSTRUCTOR"
            or lesson.course.instructor_id != self.request.user.id
        ):
            raise PermissionDenied(
                "Only the course instructor can modify this lesson."
            )

        return lesson

    def update(self, request, *args, **kwargs):
        self._check_course_instructor()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._check_course_instructor()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._check_course_instructor()
        return super().destroy(request, *args, **kwargs)

