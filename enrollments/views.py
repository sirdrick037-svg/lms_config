
import base64
import logging
from datetime import datetime
from decimal import Decimal
from zoneinfo import ZoneInfo

import requests
from django.conf import settings
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Enrollment, LessonProgress, Payment
from .serializers import EnrollmentSerializer, LessonProgressSerializer, PaymentSerializer

logger = logging.getLogger(__name__)


def mpesa_base_url():
    if settings.MPESA_ENVIRONMENT == "sandbox":
        return "https://sandbox.safaricom.co.ke"
    return "https://api.safaricom.co.ke"


def get_mpesa_access_token():
    response = requests.get(
        f"{mpesa_base_url()}/oauth/v1/generate",
        params={"grant_type": "client_credentials"},
        auth=(
            settings.MPESA_CONSUMER_KEY,
            settings.MPESA_CONSUMER_SECRET,
        ),
        timeout=20,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def normalize_phone(phone):
    phone = phone.strip().replace(" ", "").replace("-", "")

    if phone.startswith("+254"):
        phone = phone[1:]
    elif phone.startswith("0") and len(phone) == 10:
        phone = "254" + phone[1:]

    if len(phone) != 12 or not phone.startswith("254"):
        raise ValidationError({
            "phone_number": "Use a Kenyan number such as 254712345678."
        })

    if not phone.isdigit():
        raise ValidationError({
            "phone_number": "The phone number must contain digits only."
        })

    return phone


def initiate_stk_push(payment):
    phone = normalize_phone(payment.phone_number)

    # Daraja STK Push amounts must be whole KES amounts.
    if payment.amount != payment.amount.to_integral_value():
        raise ValueError("The course price must be a whole KES amount.")

    amount = int(payment.amount)
    if amount < 1:
        raise ValueError("The payment amount must be at least KES 1.")

    shortcode = str(settings.MPESA_SHORTCODE)
    timestamp = datetime.now(
        ZoneInfo("Africa/Nairobi")
    ).strftime("%Y%m%d%H%M%S")

    password = base64.b64encode(
        f"{shortcode}{settings.MPESA_PASSKEY}{timestamp}".encode()
    ).decode()

    access_token = get_mpesa_access_token()

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone,
        "PartyB": shortcode,
        "PhoneNumber": phone,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": f"COURSE{payment.course_id}",
        "TransactionDesc": "Course payment",
    }

    response = requests.post(
        f"{mpesa_base_url()}/mpesa/stkpush/v1/processrequest",
        json=payload,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        timeout=30,
    )
    response.raise_for_status()
    result = response.json()

    if result.get("ResponseCode") != "0":
        raise ValueError(
            result.get("ResponseDescription", "STK Push was rejected.")
        )

    checkout_id = result.get("CheckoutRequestID")
    if not checkout_id:
        raise ValueError("Daraja did not return a checkout request ID.")

    payment.checkout_request_id = checkout_id
    payment.phone_number = phone
    payment.save(update_fields=[
        "checkout_request_id", "phone_number", "updated_at"
    ])

    return result


class EnrollmentListCreateView(generics.ListCreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(
            student=self.request.user
        ).select_related("course", "student")

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data["course"]

        if user.role != "STUDENT":
            raise PermissionDenied(
                "Only students can enroll in courses."
            )

        if not course.is_published:
            raise ValidationError(
                "You can only enroll in published courses."
            )

        if Enrollment.objects.filter(
            student=user, course=course
        ).exists():
            raise ValidationError({
                "course": "You are already enrolled in this course."
            })

        if course.price > 0:
            has_paid = Payment.objects.filter(
                student=user,
                course=course,
                status=Payment.Status.SUCCESS,
            ).exists()

            if not has_paid:
                raise ValidationError({
                    "payment": (
                        "Please complete payment before enrolling "
                        "in this course."
                    )
                })

        serializer.save(student=user)


class EnrollmentDetailView(generics.RetrieveAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(
            student=self.request.user
        ).select_related("course", "student")


class LessonProgressListCreateView(generics.ListCreateAPIView):
    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LessonProgress.objects.filter(
            enrollment__student=self.request.user
        ).select_related("enrollment", "lesson", "lesson__course")

    def perform_create(self, serializer):
        user = self.request.user
        enrollment = serializer.validated_data["enrollment"]
        lesson = serializer.validated_data["lesson"]
        is_completed = serializer.validated_data.get(
            "is_completed", False
        )

        if user.role != "STUDENT":
            raise PermissionDenied(
                "Only students can track lesson progress."
            )

        if enrollment.student_id != user.id:
            raise PermissionDenied(
                "You can only track progress for your own enrollments."
            )

        if enrollment.course_id != lesson.course_id:
            raise ValidationError({
                "lesson": "The lesson must belong to your enrolled course."
            })

        if LessonProgress.objects.filter(
            enrollment=enrollment, lesson=lesson
        ).exists():
            raise ValidationError({
                "lesson": "A progress record already exists for this lesson."
            })

        serializer.save(
            completed_at=timezone.now() if is_completed else None
        )


class LessonProgressDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LessonProgress.objects.filter(
            enrollment__student=self.request.user
        ).select_related("enrollment", "lesson", "lesson__course")

    def perform_update(self, serializer):
        is_completed = serializer.validated_data.get(
            "is_completed",
            serializer.instance.is_completed,
        )

        if is_completed and not serializer.instance.is_completed:
            completed_at = timezone.now()
        elif not is_completed:
            completed_at = None
        else:
            completed_at = serializer.instance.completed_at

        serializer.save(completed_at=completed_at)


class PaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(
            student=self.request.user
        ).select_related("course", "student")

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data["course"]
        phone = normalize_phone(
            serializer.validated_data["phone_number"]
        )

        if user.role != "STUDENT":
            raise PermissionDenied(
                "Only students can initiate course payments."
            )

        if not course.is_published:
            raise ValidationError(
                "You can only pay for published courses."
            )

        if course.price <= 0:
            raise ValidationError(
                "This course does not require payment."
            )

        if Enrollment.objects.filter(
            student=user, course=course
        ).exists():
            raise ValidationError(
                "You are already enrolled in this course."
            )

        payment = serializer.save(
            student=user,
            amount=course.price,
            method=Payment.Method.MPESA,
            status=Payment.Status.PENDING,
            phone_number=phone,
        )

        try:
            initiate_stk_push(payment)
        except requests.RequestException:
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status", "updated_at"])
            logger.exception("M-Pesa API request failed.")
            raise ValidationError(
                "Could not contact M-Pesa. Check your sandbox settings "
                "and server logs before retrying."
            )
        except (ValueError, KeyError):
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status", "updated_at"])
            logger.exception("M-Pesa STK Push failed.")
            raise ValidationError(
                "M-Pesa rejected the STK Push request. "
                "Check your settings and server logs."
            )


class MpesaCallbackView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        callback = request.data.get("Body", {}).get("stkCallback", {})
        checkout_id = callback.get("CheckoutRequestID")
        result_code = callback.get("ResultCode")

        if not checkout_id or result_code is None:
            return Response(
                {"ResultCode": 0, "ResultDesc": "Callback received"},
                status=status.HTTP_200_OK,
            )

        try:
            payment = Payment.objects.get(
                checkout_request_id=checkout_id
            )
        except Payment.DoesNotExist:
            logger.warning("Callback received for an unknown checkout ID.")
            return Response(
                {"ResultCode": 0, "ResultDesc": "Callback received"},
                status=status.HTTP_200_OK,
            )

        # Do not overwrite a previously recorded final result.
        if payment.status != Payment.Status.PENDING:
            return Response(
                {"ResultCode": 0, "ResultDesc": "Callback received"},
                status=status.HTTP_200_OK,
            )

        if result_code == 0:
            items = callback.get(
                "CallbackMetadata", {}
            ).get("Item", [])
            metadata = {
                item.get("Name"): item.get("Value")
                for item in items
            }

            receipt = metadata.get("MpesaReceiptNumber")
            callback_amount = metadata.get("Amount")
            callback_phone = metadata.get("PhoneNumber")

            # Check that key transaction details match our pending payment.
            phone_matches = (
                callback_phone is not None
                and str(callback_phone) == payment.phone_number
            )
            amount_matches = (
                callback_amount is not None
                and Decimal(str(callback_amount)) == payment.amount
            )

            if receipt and phone_matches and amount_matches:
                payment.status = Payment.Status.SUCCESS
                payment.mpesa_receipt_number = str(receipt)
            else:
                logger.warning(
                    "M-Pesa callback details did not match payment %s.",
                    payment.id,
                )
                payment.status = Payment.Status.FAILED
        else:
            payment.status = Payment.Status.FAILED

        payment.save(update_fields=[
            "status", "mpesa_receipt_number", "updated_at"
        ])

        return Response(
            {"ResultCode": 0, "ResultDesc": "Callback received"},
            status=status.HTTP_200_OK,
        )
