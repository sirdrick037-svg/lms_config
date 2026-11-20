
from django.urls import path
from .views import (
    ContactMessageCreateView,
    ContactMessageListView,
    InstructorMessageCreateView,
    InstructorMessageListView,
)

urlpatterns = [
    # General Contact Us messages
    path("", ContactMessageCreateView.as_view(), name="contact-message-create"),
    path("admin/", ContactMessageListView.as_view(), name="contact-message-list"),

    # Student-to-instructor messages
    path(
        "instructor/send/",
        InstructorMessageCreateView.as_view(),
        name="instructor-message-create",
    ),
    path(
        "instructor/",
        InstructorMessageListView.as_view(),
        name="instructor-message-list",
    ),
]
