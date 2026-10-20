
from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    instructor_username = serializers.CharField(
        source="instructor.username",
        read_only=True,
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "instructor",
            "instructor_username",
            "is_published",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "instructor",
            "instructor_username",
            "created_at",
            "updated_at",
        ]
