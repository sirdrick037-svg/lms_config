
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import JoinRequest, UserInvitation
from .serializers import (
    AcceptInvitationSerializer,
    EmailTokenObtainPairSerializer,
    JoinRequestSerializer,
)
from .services import create_invitation


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        return Response(
            {
                "detail": (
                    "Public registration is disabled. "
                    "Please submit a join request or use an invitation link."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class JoinRequestCreateView(generics.CreateAPIView):
    serializer_class = JoinRequestSerializer
    permission_classes = [AllowAny]


class AdminJoinRequestListView(generics.ListAPIView):
    serializer_class = JoinRequestSerializer
    permission_classes = [IsAdminUser]
    queryset = JoinRequest.objects.all().order_by("-submitted_at")


class JoinRequestReviewView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        join_request = generics.get_object_or_404(
            JoinRequest,
            pk=pk,
        )

        if join_request.status != JoinRequest.Status.PENDING:
            return Response(
                {"detail": "This request has already been reviewed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        action = request.data.get("action")
        admin_notes = request.data.get("admin_notes", "")

        if action == "reject":
            join_request.status = JoinRequest.Status.REJECTED
            join_request.reviewed_by = request.user
            join_request.reviewed_at = timezone.now()
            join_request.admin_notes = admin_notes
            join_request.save()

            return Response(
                {"detail": "Join request rejected."},
                status=status.HTTP_200_OK,
            )

        if action != "approve":
            return Response(
                {"detail": "Action must be approve or reject."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        role = join_request.requested_role
        course_ids = request.data.get("course_ids", [])

        if role == "INSTRUCTOR" and not course_ids:
            return Response(
                {"detail": "Select at least one course for this instructor."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from courses.models import Course

        courses = Course.objects.filter(id__in=course_ids)

        if role == "INSTRUCTOR" and courses.count() != len(set(course_ids)):
            return Response(
                {"detail": "One or more selected courses do not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            invitation = create_invitation(
                email=join_request.email,
                role=role,
                invited_by=request.user,
                courses=courses,
            )
        except Exception:
            return Response(
                {
                    "detail": (
                        "The invitation could not be sent. "
                        "The join request has not been approved."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        join_request.status = JoinRequest.Status.APPROVED
        join_request.reviewed_by = request.user
        join_request.reviewed_at = timezone.now()
        join_request.admin_notes = admin_notes
        join_request.save()

        return Response(
            {
                "detail": "Join request approved and invitation sent.",
                "invitation_id": invitation.id,
            },
            status=status.HTTP_200_OK,
        )


class AcceptInvitationView(generics.CreateAPIView):
    serializer_class = AcceptInvitationSerializer
    permission_classes = [AllowAny]
