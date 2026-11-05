
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework.exceptions import PermissionDenied

from .models import Course, Lesson
from .serializers import CourseSerializer, LessonSerializer
from enrollments.models import Enrollment


class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Course.objects.all()

        # Visitors can see published courses only.
        if not user.is_authenticated:
            return queryset.filter(is_published=True)

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

        # Administrators can access all lessons.
        if user.is_staff:
            pass

        # Instructors can access lessons in their own courses.
        elif user.role == "INSTRUCTOR":
            queryset = queryset.filter(course__instructor=user)

        # Students can only access lessons in courses
        # they have enrolled in.
        else:
            enrolled_course_ids = Enrollment.objects.filter(
                student=user
            ).values_list("course_id", flat=True)

            queryset = queryset.filter(
                course__is_published=True,
                course_id__in=enrolled_course_ids
            )

        course_id = self.request.query_params.get("course")

        if course_id:
            queryset = queryset.filter(course_id=course_id)

        return queryset

    def perform_create(self, serializer):
        course = serializer.validated_data["course"]
        user = self.request.user

        # Administrators can add lessons to any course.
        if user.is_staff:
            serializer.save()
            return

        # Instructors can add lessons only to their own courses.
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

        # Administrators can manage all lessons.
        if user.is_staff:
            return queryset

        # Instructors can manage lessons in their own courses.
        if user.role == "INSTRUCTOR":
            return queryset.filter(course__instructor=user)

        # Students can only view lessons in courses
        # they have enrolled in.
        enrolled_course_ids = Enrollment.objects.filter(
            student=user
        ).values_list("course_id", flat=True)

        return queryset.filter(
            course__is_published=True,
            course_id__in=enrolled_course_ids
        )

    def perform_update(self, serializer):
        user = self.request.user

        # Administrators can update any lesson.
        if user.is_staff:
            serializer.save()
            return

        # Instructors can only update lessons in their own courses.
        if user.role == "INSTRUCTOR":
            course = serializer.validated_data.get(
                "course",
                serializer.instance.course
            )

            if course.instructor_id != user.id:
                raise PermissionDenied(
                    "You can only edit lessons in your own courses."
                )

            serializer.save()
            return

        raise PermissionDenied(
            "Students are not allowed to edit lessons."
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if user.is_staff:
            instance.delete()
            return

        if user.role == "INSTRUCTOR":
            instance.delete()
            return

        raise PermissionDenied(
            "Students are not allowed to delete lessons."
        )