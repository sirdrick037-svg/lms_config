
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.mark.django_db
def test_student_can_register():
    client = APIClient()

    response = client.post(
        "/api/auth/register/",
        {
            "username": "teststudent",
            "email": "teststudent@example.com",
            "password": "StrongPass123!",
        },
        format="json",
    )

    assert response.status_code == 201
    assert User.objects.filter(username="teststudent").exists()
    assert "password" not in response.data


@pytest.mark.django_db
def test_registration_rejects_short_password():
    client = APIClient()

    response = client.post(
        "/api/auth/register/",
        {
            "username": "shortpassstudent",
            "email": "shortpass@example.com",
            "password": "123",
        },
        format="json",
    )

    assert response.status_code == 400
    assert not User.objects.filter(
        username="shortpassstudent"
    ).exists()
