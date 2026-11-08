
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
        read_only_fields = ["id","quiz"]



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
    question_text = serializers.CharField(
        source="question.text",
        read_only=True
    )

    option_a = serializers.CharField(
        source="question.option_a",
        read_only=True
    )
    option_b = serializers.CharField(
        source="question.option_b",
        read_only=True
    )
    option_c = serializers.CharField(
        source="question.option_c",
        read_only=True
    )
    option_d = serializers.CharField(
        source="question.option_d",
        read_only=True
    )

    class Meta:
        model = Answer
        fields = [
            "id",
            "attempt",
            "question",
            "question_text",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "selected_answer",
            "is_correct",
        ]
        read_only_fields = [
            "id",
            "attempt",
            "is_correct",
            "question_text",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
        ]



class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    student_username = serializers.CharField(
        source="student.username",
        read_only=True
    )
    quiz_title = serializers.CharField(
        source="quiz.title",
        read_only=True
    )

    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "student",
            "student_username",
            "quiz",
            "quiz_title",
            "score",
            "passed",
            "review_status",
            "reviewed_by",
            "reviewed_at",
            "started_at",
            "submitted_at",
            "answers",
        ]

        read_only_fields = [
            "id",
            "student",
            "score",
            "passed",
            "review_status",
            "reviewed_by",
            "reviewed_at",
            "started_at",
            "submitted_at",
            "answers",
        ]
class QuizReviewSerializer(serializers.Serializer):
    review_status = serializers.ChoiceField(
        choices=["PASS", "FAIL"]
    )        
