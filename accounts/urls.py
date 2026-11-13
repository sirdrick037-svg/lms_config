
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import  RegisterView, EmailTokenObtainPairView, JoinRequestCreateView, AdminJoinRequestListView, JoinRequestReviewView, AcceptInvitationView

urlpatterns = [
    # Public registration is disabled
    path("register/", RegisterView.as_view(), name="register"),

    # Login and token refresh
    path("token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Public join requests
    path("join-requests/", JoinRequestCreateView.as_view(), name="join-request-create"),

    # Admin-only join request management
    path("admin/join-requests/", AdminJoinRequestListView.as_view(), name="admin-join-request-list"),
    path("admin/join-requests/<int:pk>/review/", JoinRequestReviewView.as_view(), name="admin-join-request-review"),

    # Accept an invitation
    path("accept-invitation/", AcceptInvitationView.as_view(), name="accept-invitation"),
]
