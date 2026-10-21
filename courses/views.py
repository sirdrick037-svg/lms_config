
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .models import Course, Lesson
from .serializers import CourseSerializer, LessonSerializer


class CourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Course.objects.select_related("instructor")

        if user.is_staff:
            return queryset

        if user.role == "INSTRUCTOR":
            return queryset.filter(instructor=user)

        return queryset.filter(is_published=True)

    def perform_create(self, serializer):
        if self.request.user.role != "INSTRUCTOR":
            raise PermissionDenied(
                "Only instructors can create courses."
            )

        serializer.save(instructor=self.request.user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Course.objects.select_related("instructor")

        if user.is_staff:
            return queryset

        if user.role == "INSTRUCTOR":
            return queryset.filter(instructor=user)

        return queryset.filter(is_published=True)

    def _check_course_permission(self):
        course = self.get_object()
        user = self.request.user

        if not user.is_staff and (
            user.role != "INSTRUCTOR"
            or course.instructor_id != user.id
        ):
            raise PermissionDenied(
                "You can only modify your own courses."
            )

    def update(self, request, *args, **kwargs):
        self._check_course_permission()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._check_course_permission()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._check_course_permission()
        return super().destroy(request, *args, **kwargs)


class LessonListCreateView(generics.ListCreateAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Lesson.objects.select_related("course")

        if user.is_staff:
            return queryset

        if user.role == "INSTRUCTOR":
            return queryset.filter(course__instructor=user)

        return queryset.filter(
            course__is_published=True
        )

    def perform_create(self, serializer):
        course = serializer.validated_data["course"]
        user = self.request.user

        if (
            user.role != "INSTRUCTOR"
            or course.instructor_id != user.id
        ):
            raise PermissionDenied(
                "You can only add lessons to your own courses."
            )

        serializer.save()


class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Lesson.objects.select_related("course")

        if user.is_staff:
            return queryset

        if user.role == "INSTRUCTOR":
            return queryset.filter(course__instructor=user)

        return queryset.filter(
            course__is_published=True
        )

    def _check_course_instructor(self):
        lesson = self.get_object()
        user = self.request.user

        if not user.is_staff and (
            user.role != "INSTRUCTOR"
            or lesson.course.instructor_id != user.id
        ):
            raise PermissionDenied(
                "You can only modify lessons in your own courses."
            )

    def update(self, request, *args, **kwargs):
        self._check_course_instructor()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._check_course_instructor()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._check_course_instructor()
        return super().destroy(request, *args, **kwargs)
