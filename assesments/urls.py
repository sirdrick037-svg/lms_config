
from django.urls import path

from .views import QuizListCreateView, QuizDetailView, QuestionListCreateView, QuizAttemptListCreateView, SubmitQuizView

urlpatterns = [
    path("quizzes/", QuizListCreateView.as_view(), name="quiz-list-create"),
    path("quizzes/<int:pk>/", QuizDetailView.as_view(), name="quiz-detail"),
    path("quizzes/<int:quiz_id>/questions/",QuestionListCreateView.as_view(),name="question-list-create"),
    path("attempts/", QuizAttemptListCreateView.as_view(), name="attempt-list-create"),
    path("attempts/<int:attempt_id>/submit/",SubmitQuizView.as_view(),name="submit-quiz"),
]
