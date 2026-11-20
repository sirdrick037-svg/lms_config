
from django.urls import path
from .views import ContactMessageCreateView, ContactMessageListView

urlpatterns = [
    path("", ContactMessageCreateView.as_view(), name="contact-message-create"),
    path("admin/", ContactMessageListView.as_view(), name="contact-message-list"),
]
