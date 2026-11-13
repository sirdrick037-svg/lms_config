
import hashlib

from django.contrib.auth import get_user_model, password_validation
from django.db import transaction
from django.utils import timezone

from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserInvitation

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Legacy registration serializer. We will disable its public endpoint."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate_username(self, value):
        value = value.strip()

        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this username already exists."
            )

        return value

    def create(self, validated_data):
        return User.objects.create_user(
            **validated_data,
            role=User.Role.STUDENT,
        )


class AcceptInvitationSerializer(serializers.Serializer):
    token = serializers.CharField(write_only=True)
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    def validate_username(self, value):
        value = value.strip()

        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "This username is already taken."
            )

        return value

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def validate(self, attrs):
        token_hash = hashlib.sha256(
            attrs["token"].encode()
        ).hexdigest()

        invitation = UserInvitation.objects.filter(
            token_hash=token_hash
        ).first()

        if not invitation:
            raise serializers.ValidationError(
                {"token": "Invalid invitation link."}
            )

        if invitation.accepted_at:
            raise serializers.ValidationError(
                {"token": "This invitation has already been used."}
            )

        if invitation.revoked_at:
            raise serializers.ValidationError(
                {"token": "This invitation has been revoked."}
            )

        if invitation.expires_at <= timezone.now():
            raise serializers.ValidationError(
                {"token": "This invitation has expired."}
            )

        if User.objects.filter(
            email__iexact=invitation.email
        ).exists():
            raise serializers.ValidationError(
                {"token": "An account with this email already exists."}
            )

        attrs["invitation"] = invitation
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            invitation = UserInvitation.objects.select_for_update().get(
                pk=validated_data["invitation"].pk
            )

            if (
                invitation.accepted_at
                or invitation.revoked_at
                or invitation.expires_at <= timezone.now()
            ):
                raise serializers.ValidationError(
                    "This invitation is no longer valid."
                )

            if User.objects.filter(
                email__iexact=invitation.email
            ).exists():
                raise serializers.ValidationError(
                    "An account with this email already exists."
                )

            user = User.objects.create_user(
                username=validated_data["username"],
                email=invitation.email,
                password=validated_data["password"],
                role=invitation.role,
            )

            if invitation.role == User.Role.INSTRUCTOR:
               for course in invitation.courses.all():
                course.instructors.add(user)

        if not course.instructor_id:
            course.instructor = user
            course.save(update_fields=["instructor"])

        invitation.accepted_at = timezone.now()
        invitation.save(update_fields=["accepted_at"])

        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields.pop(self.username_field)
        self.fields["email"] = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.pop("email").strip().lower()

        user = User.objects.filter(email__iexact=email).first()

        if not user:
            raise AuthenticationFailed("Invalid email or password.")

        if not user.is_active:
            raise AuthenticationFailed("This account is inactive.")

        attrs[self.username_field] = user.get_username()

        data = super().validate(attrs)

        data["user"] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "is_staff": user.is_staff,
        }

        return data


from .models import JoinRequest


class JoinRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = JoinRequest
        fields = [
            "id",
            "name",
            "email",
            "requested_role",
            "message",
            "status",
            "submitted_at",
        ]

        read_only_fields = [
            "id",
            "status",
            "submitted_at",
        ]

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "This email already has a SkillNest account."
            )

        return value

    def validate_requested_role(self, value):
        if value not in [
            User.Role.STUDENT,
            User.Role.INSTRUCTOR,
        ]:
            raise serializers.ValidationError(
                "Choose either Student or Instructor."
            )

        return value

    def validate(self, attrs):
        email = attrs.get("email", "").strip().lower()

        if JoinRequest.objects.filter(
            email__iexact=email,
            status=JoinRequest.Status.PENDING,
        ).exists():
            raise serializers.ValidationError(
                "You already have a pending join request."
            )

        return attrs
