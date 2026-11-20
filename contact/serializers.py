
from rest_framework import serializers
from .models import ContactMessage, InstructorMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "name",
            "email",
            "subject",
            "message",
            "created_at",
            "is_read",
        ]
        read_only_fields = ["id", "created_at", "is_read"]


class InstructorMessageSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.username",
        read_only=True,
    )
    instructor_name = serializers.CharField(
        source="instructor.username",
        read_only=True,
    )
    course_title = serializers.CharField(
        source="course.title",
        read_only=True,
    )

    class Meta:
        model = InstructorMessage
        fields = [
            "id",
            "student",
            "student_name",
            "instructor",
            "instructor_name",
            "course",
            "course_title",
            "subject",
            "message",
            "created_at",
            "is_read",
        ]
        read_only_fields = [
            "id",
            "student",
            "student_name",
            "instructor",
            "instructor_name",
            "course_title",
            "created_at",
            "is_read",
        ]
