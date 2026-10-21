from django.shortcuts import render
from django.contrib import admin
from .models import Quiz, Question, QuizAttempt, Answer
# Create your views here.
@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "is_published", "passing_score")
    list_filter = ("is_published",)
    search_fields = ("title", "course__title")


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("text", "quiz")
    list_filter = ("quiz",)
    search_fields = ("text",)


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ("student", "quiz", "score", "passed", "submitted_at")
    list_filter = ("passed", "quiz")


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ("attempt", "question", "selected_answer", "is_correct")
