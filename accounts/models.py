from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):

    class Role(models.TextChoices):
        STUDENT = "STUDENT", "Student"
        INSTRUCTOR = "INSTRUCTOR", "Instructor"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class UserInvitation(models.Model):

    email = models.EmailField(db_index=True)

    role = models.CharField(
        max_length=20,
        choices=User.Role.choices,
    )

    token_hash = models.CharField(
        max_length=64,
        unique=True,
    )

    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="sent_invitations",
    )

    courses = models.ManyToManyField(
        "courses.Course",
        blank=True,
        related_name="user_invitations",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    expires_at = models.DateTimeField()

    accepted_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    revoked_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.email} - {self.role} invitation"


class JoinRequest(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    name = models.CharField(max_length=150)

    email = models.EmailField(db_index=True)

    requested_role = models.CharField(
        max_length=20,
        choices=User.Role.choices,
    )

    message = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    submitted_at = models.DateTimeField(auto_now_add=True)

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_join_requests",
    )

    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    admin_notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} - {self.requested_role} ({self.status})"

    

    