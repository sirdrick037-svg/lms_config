
from rest_framework import serializers
from .models import Enrollment, LessonProgress


class EnrollmentSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(
        source="student.username",
        read_only=True,
    )
    course_title = serializers.CharField(
        source="course.title",
        read_only=True,
    )

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student",
            "student_username",
            "course",
            "course_title",
            "enrolled_at",
        ]
        read_only_fields = [
            "id",
            "student",
            "student_username",
            "enrolled_at",
        ]

    def create(self, validated_data):
        return Enrollment.objects.create(
            student=self.context["request"].user,
            **validated_data,
        )

class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(
        source="lesson.title",
        read_only=True,
    )
    course_title = serializers.CharField(
        source="lesson.course.title",
        read_only=True,
    )

    class Meta:
        model = LessonProgress
        fields = [
            "id",
            "enrollment",
            "lesson",
            "lesson_title",
            "course_title",
            "is_completed",
            "completed_at",
        ]
        read_only_fields = [
            "id",
            "enrollment",
            "lesson_title",
            "course_title",
            "completed_at",
        ]
