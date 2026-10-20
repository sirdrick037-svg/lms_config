from django.shortcuts import render

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Course
from .serializers import CourseSerializer

# Create your views here.
class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.select_related("instructor").all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != "INSTRUCTOR":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "Only instructors can create courses."
            )

        serializer.save(instructor=self.request.user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.select_related("instructor").all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            from rest_framework.permissions import IsAdminUser
            return [IsAuthenticated(), IsAdminUser()]
        return super().get_permissions()
