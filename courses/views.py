
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Course, Lesson
from .serializers import CourseSerializer, LessonSerializer


class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Course.objects.all()

        if user.is_staff:
            return queryset

        if user.role == "INSTRUCTOR":
            return queryset.filter(instructor=user)

        return queryset.filter(is_published=True)

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != "INSTRUCTOR" and not user.is_staff:
            raise PermissionDenied(
                "Only instructors can create courses."
            )

        serializer.save(instructor=user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Course.objects.all()

        if user.is_staff:
            return queryset

        if user.role == "INSTRUCTOR":
            return queryset.filter(instructor=user)

        return queryset.filter(is_published=True)


class LessonListCreateView(generics.ListCreateAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Lesson.objects.select_related("course")

        if user.is_staff:
            pass
        elif user.role == "INSTRUCTOR":
            queryset = queryset.filter(course__instructor=user)
        else:
            queryset = queryset.filter(course__is_published=True)

        # Optional course filter, e.g. ?course=10
        course_id = self.request.query_params.get("course")
        if course_id:
            queryset = queryset.filter(course_id=course_id)

        return queryset

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
    queryset = Lesson.objects.select_related("course")
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Lesson.objects.select_related("course")

        if user.is_staff:
            return queryset

        if user.role == "INSTRUCTOR":
            return queryset.filter(course__instructor=user)

        return queryset.filter(course__is_published=True)
