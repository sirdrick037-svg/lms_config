from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Course, Lesson

User = get_user_model()


class CourseSerializer(serializers.ModelSerializer):
    instructor_username = serializers.CharField(
        source="instructor.username",
        read_only=True,
    )

    instructors = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.filter(role="INSTRUCTOR"),
        required=False,
    )

    instructors_details = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "price",
            "instructor",
            "instructor_username",
            "instructors",
            "instructors_details",
            "is_published",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "instructor",
            "instructor_username",
            "instructors_details",
            "created_at",
            "updated_at",
        ]

    def get_instructors_details(self, obj):
        return [
            {
                "id": instructor.id,
                "username": instructor.username,
                "first_name": instructor.first_name,
                "last_name": instructor.last_name,
            }
            for instructor in obj.instructors.all()
        ]


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "id",
            "course",
            "title",
            "content",
            "order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]