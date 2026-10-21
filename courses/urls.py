
from django.urls import path
from .views import CourseListCreateView, CourseDetailView, LessonListCreateView, LessonDetailView

urlpatterns = [
    path("", CourseListCreateView.as_view(), name="course-list-create"),
    path("<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
      path("lessons/", LessonListCreateView.as_view(), name="lesson-list-create"),
    path("lessons/<int:pk>/",LessonDetailView.as_view(),name="lesson-detail",),
]
