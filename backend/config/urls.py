from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from rest_framework.routers import DefaultRouter
from products.views import (
    BrandViewSet, PrinterModelViewSet, CategoryViewSet,
    ProductViewSet, SystemStatusView, AdminDashboardStatsView, CustomerListView,
    ImageUploadView, BannerViewSet
)
from orders.views import OrderViewSet
from accounts.views import (
    LoginView, RegisterView, GoogleAuthView, LogoutView, CurrentUserView,
    ChangePasswordView, ToggleUserActiveView, AdminEmployeeListView, AdminAccountListView, AdminRoleListView
)

router = DefaultRouter()
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'printers', PrinterModelViewSet, basename='printer')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'banners', BannerViewSet, basename='banner')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/status/', SystemStatusView.as_view(), name='system-status'),
    path('api/admin/dashboard-stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('api/admin/customers/', CustomerListView.as_view(), name='admin-customers'),
    path('api/admin/employees/', AdminEmployeeListView.as_view(), name='admin-employees'),
    path('api/admin/accounts/', AdminAccountListView.as_view(), name='admin-accounts'),
    path('api/admin/roles/', AdminRoleListView.as_view(), name='admin-roles'),
    path('api/admin/toggle-user-active/', ToggleUserActiveView.as_view(), name='admin-toggle-active'),
    path('api/upload-image/', ImageUploadView.as_view(), name='upload-image'),

    # Authentication Endpoints
    path('api/auth/login/', LoginView.as_view(), name='auth-login'),
    path('api/auth/register/', RegisterView.as_view(), name='auth-register'),
    path('api/auth/google/', GoogleAuthView.as_view(), name='auth-google'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('api/auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),

    path('api/', include(router.urls)),

    # Media and Static files serving
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR / 'static'}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
