from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication that allows API requests from authorized CORS origins
    without requiring CSRF token cookie overhead for REST requests.
    """
    def enforce_csrf(self, request):
        return  # CSRF check bypassed for API when CORS origin is strictly validated


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read-only access (GET, HEAD, OPTIONS) to any user,
    while restricting write/edit/delete operations to authenticated staff or admin users.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or request.user.is_superuser)
        )


class IsAdminOrStaff(permissions.BasePermission):
    """
    Custom permission to restrict endpoint access exclusively to authenticated staff or admin users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or request.user.is_superuser)
        )
