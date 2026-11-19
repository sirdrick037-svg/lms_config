from django.urls import path

from .views import QuizListCreateView, QuizDetailView, QuestionListCreateView, QuestionDetailView,  QuizAttemptListCreateView, SubmitQuizView, QuizSubmissionReviewListView, ReviewQuizAttemptView


urlpatterns = [
    
    path("quizzes/", QuizListCreateView.as_view(),name="quiz-list-create"),
    path("quizzes/<int:pk>/", QuizDetailView.as_view(), name="quiz-detail"),
    path("quizzes/<int:quiz_id>/questions/", QuestionListCreateView.as_view(), name="question-list-create"),
    path("questions/<int:pk>/", QuestionDetailView.as_view(), name="question-detail"),
    path("attempts/", QuizAttemptListCreateView.as_view(), name="attempt-list-create" ),
    path( "attempts/<int:attempt_id>/submit/", SubmitQuizView.as_view(), name="submit-quiz" ),
    path( "attempts/review/", QuizSubmissionReviewListView.as_view(), name="quiz-submission-review-list" ),
    path( "attempts/<int:attempt_id>/review/", ReviewQuizAttemptView.as_view(), name="review-quiz-attempt" ),
]