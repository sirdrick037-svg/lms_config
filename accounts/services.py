
import hashlib
import secrets
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import UserInvitation


def create_invitation(email, role, invited_by, courses=None):
    """
    Create a secure invitation and send it by email.
    """

    email = email.strip().lower()

    # Generate a secure random token
    token = secrets.token_urlsafe(32)

    # Store only the hashed token
    token_hash = hashlib.sha256(
        token.encode()
    ).hexdigest()

    # Set invitation expiry to 24 hours
    expires_at = timezone.now() + timedelta(hours=24)

    invitation = UserInvitation.objects.create(
        email=email,
        role=role,
        token_hash=token_hash,
        invited_by=invited_by,
        expires_at=expires_at,
    )

    # Assign courses if this is an instructor invitation
    if courses:
        invitation.courses.set(courses)

    # Generate registration link
    registration_link = (
        f"{settings.FRONTEND_URL}/accept-invitation/"
        f"?token={token}"
    )

    subject = "Invitation to join SkillNest"

    message = f"""
Hello,

You have been invited to join SkillNest as a {role.lower()}.

To complete your registration, click the link below:

{registration_link}

This invitation expires in 24 hours.

If you did not expect this invitation, please ignore this email.

Welcome to SkillNest!
"""

    # Send invitation email
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )

    return invitation


def regenerate_invitation_link(invitation):
    import hashlib
    import secrets
    from datetime import timedelta
    from django.utils import timezone
    from django.conf import settings
    from django.core.mail import send_mail

    token = secrets.token_urlsafe(32)

    invitation.token_hash = hashlib.sha256(
        token.encode()
    ).hexdigest()

    invitation.created_at = timezone.now()
    invitation.expires_at = timezone.now() + timedelta(hours=24)
    invitation.accepted_at = None
    invitation.revoked_at = None

    invitation.save()

    registration_link = (
        f"{settings.FRONTEND_URL}/accept-invitation/?token={token}"
    )

    send_mail(
        "Your new SkillNest invitation",
        f"Complete your registration here:\n{registration_link}",
        settings.DEFAULT_FROM_EMAIL,
        [invitation.email],
        fail_silently=False,
    )

    return registration_link
