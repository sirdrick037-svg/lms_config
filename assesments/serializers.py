
from rest_framework import serializers

from .models import Quiz, Question, QuizAttempt, Answer


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            "id",
            "quiz",
            "text",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
        ]
        read_only_fields = ["id"]


class QuestionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            "id",
            "quiz",
            "text",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "correct_answer",
        ]
        read_only_fields = ["id"]



class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "course",
            "title",
            "description",
            "passing_score",
            "is_published",
            "created_at",
            "questions",
        ]
        read_only_fields = ["id", "created_at"]


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = [
            "id",
            "attempt",
            "question",
            "selected_answer",
            "is_correct",
        ]
        read_only_fields = ["id", "attempt", "is_correct"]


class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "student",
            "quiz",
            "score",
            "passed",
            "started_at",
            "submitted_at",
            "answers",
        ]
        read_only_fields = [
            "id",
            "student",
            "score",
            "passed",
            "started_at",
            "submitted_at",
            "answers",
        ]
