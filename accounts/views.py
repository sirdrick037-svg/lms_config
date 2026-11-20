from django.utils import timezone
from drf_spectacular.utils import extend_schema
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import JoinRequest
from .serializers import (
    AcceptInvitationSerializer,
    EmailTokenObtainPairSerializer,
    JoinRequestSerializer,
    JoinRequestReviewSerializer,
    AdminUserSerializer,
    RegisterSerializer,
)
from .services import create_invitation



class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        account_type = serializer.validated_data["account_type"]
        serializer.save()

        if account_type == "INSTRUCTOR":
            return Response(
                {
                    "detail": (
                        "Your instructor application has been submitted "
                        "successfully. An administrator will review it."
                    )
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "detail": "Your student account has been created successfully."
            },
            status=status.HTTP_201_CREATED,
        )


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class JoinRequestCreateView(generics.CreateAPIView):
    serializer_class = JoinRequestSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        join_request = serializer.save()

        subject = "We received your SkillNest invitation request"

        message = f"""
Hello {join_request.name},

Thank you for your interest in joining SkillNest!

We have successfully received your invitation request.

Our administrator will review your application and notify you
by email once a decision has been made.

Please note that submitting a request does not automatically
create an account.

Thank you for your patience.

The SkillNest Team
"""

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [join_request.email],
            fail_silently=False,
        )


class AdminJoinRequestListView(generics.ListAPIView):
    serializer_class = JoinRequestSerializer
    permission_classes = [IsAdminUser]
    queryset = JoinRequest.objects.all().order_by("-submitted_at")





class JoinRequestReviewView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(request=JoinRequestReviewSerializer)
    def post(self, request, pk):
        serializer = JoinRequestReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request_data = serializer.validated_data

        join_request = generics.get_object_or_404(
            JoinRequest,
            pk=pk,
        )

        if join_request.status != JoinRequest.Status.PENDING:
            return Response(
                {"detail": "This request has already been reviewed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        action = request_data["action"]
        admin_notes = request_data.get("admin_notes", "")

        # REJECT APPLICATION
        if action == "reject":
            subject = "Update on your SkillNest application"

            message = f"""
Hello {join_request.name},

Thank you for your interest in joining SkillNest.

After reviewing your application, we regret to inform you
that your request has not been approved.

Message from our administrator:
{admin_notes or "No additional comments were provided."}

Thank you for considering SkillNest.

Kind regards,
The SkillNest Team
"""

            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [join_request.email],
                    fail_silently=False,
                )
            except Exception:
                return Response(
                    {"detail": "Rejection email could not be sent."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            pending_user = User.objects.filter(
                email__iexact=join_request.email,
                is_active=False,
                role=User.Role.STUDENT,
            ).first()

            if pending_user:
                pending_user.delete()

            join_request.status = JoinRequest.Status.REJECTED
            join_request.reviewed_by = request.user
            join_request.reviewed_at = timezone.now()
            join_request.admin_notes = admin_notes
            join_request.save()

            return Response(
                {"detail": "Application rejected and email sent."},
                status=status.HTTP_200_OK,
            )

        # APPROVE APPLICATION
        role = request_data["role"]
        course_ids = request_data.get("course_ids", [])

        if role == User.Role.INSTRUCTOR and not course_ids:
            return Response(
                {"detail": "Select at least one course for this instructor."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from courses.models import Course

        courses = Course.objects.filter(id__in=course_ids)

        if role == User.Role.INSTRUCTOR:
            if courses.count() != len(set(course_ids)):
                return Response(
                    {"detail": "One or more selected courses do not exist."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            instructor = User.objects.filter(
                email__iexact=join_request.email,
                is_active=False,
            ).first()

            if not instructor:
                return Response(
                    {
                        "detail": (
                            "The pending instructor account was not found. "
                            "Please check the application before approving."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            instructor.role = User.Role.INSTRUCTOR
            instructor.is_active = True
            instructor.save(update_fields=["role", "is_active"])

            for course in courses:
                course.instructors.add(instructor)

            subject = "Your SkillNest instructor application is approved!"

            message = f"""
Hello {instructor.username},

Congratulations!

Your application to become an instructor on SkillNest
has been approved.

Your instructor account is now active.

You can log in directly using the email address and
password you provided during registration.

Login page: {settings.FRONTEND_URL}/login

Welcome to the SkillNest teaching team!

Kind regards,
The SkillNest Team
"""

            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [instructor.email],
                    fail_silently=False,
                )
            except Exception:
                instructor.is_active = False
                instructor.role = User.Role.STUDENT
                instructor.save(update_fields=["role", "is_active"])

                for course in courses:
                    course.instructors.remove(instructor)

                return Response(
                    {"detail": "Approval email could not be sent."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        else:
            try:
                invitation = create_invitation(
                    email=join_request.email,
                    role=role,
                    invited_by=request.user,
                    courses=courses,
                )
            except Exception:
                return Response(
                    {"detail": "The invitation could not be sent."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        join_request.status = JoinRequest.Status.APPROVED
        join_request.reviewed_by = request.user
        join_request.reviewed_at = timezone.now()
        join_request.admin_notes = admin_notes
        join_request.save()

        if role == User.Role.INSTRUCTOR:
            return Response(
                {
                    "detail": (
                        "Instructor approved, account activated, "
                        "and approval email sent."
                    )
                },
                status=status.HTTP_200_OK,
            )

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

class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(
            role__in=["STUDENT", "INSTRUCTOR"]
        ).order_by("-date_joined")