
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import ContactMessage
from .serializers import ContactMessageSerializer


# Public: Visitors can submit contact messages.
class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]


# Admin: View all submitted contact messages.
class ContactMessageListView(generics.ListAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAdminUser]
