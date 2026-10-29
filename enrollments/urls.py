
from django.urls import path

from .views import EnrollmentListCreateView, EnrollmentDetailView, LessonProgressListCreateView, LessonProgressDetailView, PaymentListCreateView

urlpatterns = [
    path("", EnrollmentListCreateView.as_view(), name="enrollment-list-create"),
    path("<int:pk>/", EnrollmentDetailView.as_view(), name="enrollment-detail"),
    path("progress/",LessonProgressListCreateView.as_view(),name="progress-list-create"),
    path("progress/<int:pk>/",LessonProgressDetailView.as_view(),name="progress-detail"),
    path("payments/", PaymentListCreateView.as_view(), name="payment-list-create"),
]
