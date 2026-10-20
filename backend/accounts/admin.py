from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Role, UserProfile, Employee, CustomerAccount

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name = "ملف المستخدم"
    verbose_name_plural = "ملف المستخدم"
    fk_name = 'user'
    fields = ('phone', 'role')

# -----------------------------------------------------------------------------
# 1. الموظفين (Employees)
# -----------------------------------------------------------------------------
@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['get_employee', 'get_email', 'get_phone', 'get_role', 'get_active', 'get_delete']
    list_filter = ['profile__role', 'is_active', 'is_superuser']
    search_fields = ['first_name', 'last_name', 'username', 'email', 'profile__phone']
    inlines = [UserProfileInline]
    ordering = ['id']

    class Media:
        css = {
            'all': ('admin/css/custom_dark_admin.css',)
        }
        js = ('admin/js/custom_dark_admin.js',)

    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_staff=True).select_related('profile', 'profile__role')

    @admin.display(description="الموظف", ordering="first_name")
    def get_employee(self, obj):
        name = obj.get_full_name() or obj.first_name or obj.username
        url = reverse('admin:accounts_employee_change', args=[obj.pk])
        return format_html('<a href="{}" class="admin-cyan-link">{}</a>', url, name)

    @admin.display(description="Email", ordering="email")
    def get_email(self, obj):
        return obj.email or "-"

    @admin.display(description="Phone")
    def get_phone(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.phone if profile and profile.phone else "-"

    @admin.display(description="الدور")
    def get_role(self, obj):
        profile = getattr(obj, 'profile', None)
        if not profile or not profile.role:
            return mark_safe('<span class="badge-role-none">بلا دور</span>')
        role_name = profile.role.name
        role_code = (profile.role.code or "").upper()
        if 'OWNER' in role_code or 'مالك' in role_name:
            return mark_safe('<span class="badge-role-owner">مالك</span>')
        elif 'SUPER' in role_code or 'عام' in role_name:
            return format_html('<span class="badge-role-super">{}</span>', role_name)
        else:
            return format_html('<span class="badge-role-staff">{}</span>', role_name)

    @admin.display(description="الأكتيف", ordering="is_active")
    def get_active(self, obj):
        checked = "checked" if obj.is_active else ""
        return format_html(
            '<label class="admin-switch">'
            '<input type="checkbox" {} data-user-id="{}" onchange="toggleUserActive(this)">'
            '<span class="admin-slider"></span>'
            '</label>',
            mark_safe(checked), obj.pk
        )

    @admin.display(description="حذف")
    def get_delete(self, obj):
        url = reverse('admin:accounts_employee_delete', args=[obj.pk])
        return format_html(
            '<a href="{}" class="admin-trash-btn" title="حذف">'
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            '<polyline points="3 6 5 6 21 6"></polyline>'
            '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>'
            '</svg>'
            '</a>',
            url
        )


# -----------------------------------------------------------------------------
# 2. الحسابات والزبائن (Accounts & Customers)
# -----------------------------------------------------------------------------
@admin.register(CustomerAccount)
class CustomerAccountAdmin(admin.ModelAdmin):
    list_display = ['get_customer_name', 'get_email', 'get_phone', 'get_role', 'get_is_staff', 'get_active']
    date_hierarchy = 'date_joined'
    list_filter = ['is_staff', 'is_active', 'profile__role']
    search_fields = ['first_name', 'last_name', 'username', 'email', 'profile__phone']
    inlines = [UserProfileInline]
    ordering = ['id']

    class Media:
        css = {
            'all': ('admin/css/custom_dark_admin.css',)
        }
        js = ('admin/js/custom_dark_admin.js',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('profile', 'profile__role')

    @admin.display(description="الاسم", ordering="first_name")
    def get_customer_name(self, obj):
        name = obj.get_full_name() or obj.first_name or obj.username
        url = reverse('admin:accounts_customeraccount_change', args=[obj.pk])
        return format_html('<a href="{}" class="admin-cyan-link">{}</a>', url, name)

    @admin.display(description="Email", ordering="email")
    def get_email(self, obj):
        return obj.email or "-"

    @admin.display(description="Phone")
    def get_phone(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.phone if profile and profile.phone else "-"

    @admin.display(description="الدور")
    def get_role(self, obj):
        profile = getattr(obj, 'profile', None)
        if not profile or not profile.role:
            return mark_safe('<span class="badge-role-none">بلا دور</span>')
        role_name = profile.role.name
        role_code = (profile.role.code or "").upper()
        if 'OWNER' in role_code or 'مالك' in role_name:
            return mark_safe('<span class="badge-role-owner">مالك</span>')
        elif 'SUPER' in role_code or 'عام' in role_name:
            return format_html('<span class="badge-role-super">{}</span>', role_name)
        else:
            return format_html('<span class="badge-role-staff">{}</span>', role_name)

    @admin.display(description="Is staff member", ordering="is_staff")
    def get_is_staff(self, obj):
        if obj.is_staff:
            return mark_safe(
                '<span class="icon-circle-check">'
                '<svg width="18" height="18" viewBox="0 0 24 24">'
                '<circle cx="12" cy="12" r="9" fill="#22c55e"/>'
                '<path d="M8 12l3 3 5-5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
                '</svg>'
                '</span>'
            )
        else:
            return mark_safe(
                '<span class="icon-circle-x">'
                '<svg width="18" height="18" viewBox="0 0 24 24">'
                '<circle cx="12" cy="12" r="9" fill="#ef4444" opacity="0.9"/>'
                '<path d="M15 9l-6 6M9 9l6 6" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>'
                '</svg>'
                '</span>'
            )

    @admin.display(description="الأكتيف", ordering="is_active")
    def get_active(self, obj):
        checked = "checked" if obj.is_active else ""
        return format_html(
            '<label class="admin-switch">'
            '<input type="checkbox" {} data-user-id="{}" onchange="toggleUserActive(this)">'
            '<span class="admin-slider"></span>'
            '</label>',
            mark_safe(checked), obj.pk
        )


# -----------------------------------------------------------------------------
# 3. الأدوار والصلاحيات (Roles & Permissions)
# -----------------------------------------------------------------------------
@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['get_role_badge', 'code', 'get_permissions', 'get_employee_count', 'get_is_system', 'get_delete']
    search_fields = ['name', 'code', 'permissions_summary']
    filter_horizontal = ['permissions']
    ordering = ['id']

    class Media:
        css = {
            'all': ('admin/css/custom_dark_admin.css',)
        }
        js = ('admin/js/custom_dark_admin.js',)

    @admin.display(description="اسم الدور", ordering="name")
    def get_role_badge(self, obj):
        url = reverse('admin:accounts_role_change', args=[obj.pk])
        if obj.code == 'SUPER_ADMIN' or 'عام' in obj.name:
            badge = format_html('<span class="badge-role-super">{}</span>', obj.name)
        elif obj.code == 'OWNER' or 'مالك' in obj.name:
            badge = format_html('<span class="badge-role-owner">{}</span>', obj.name)
        else:
            badge = format_html('<span class="badge-role-staff">{}</span>', obj.name)
        return format_html('<a href="{}" style="text-decoration:none">{}</a>', url, badge)

    @admin.display(description="الصلاحيات", ordering="permissions_summary")
    def get_permissions(self, obj):
        if obj.permissions_summary == 'كل الصلاحيات':
            return mark_safe('<span style="color: #22d3ee; font-weight: 800;">كل الصلاحيات</span>')
        return format_html('<span style="color: #94a3b8; font-size: 0.88rem;">{}</span>', obj.permissions_summary)

    @admin.display(description="عدد الموظفين")
    def get_employee_count(self, obj):
        return obj.employee_count

    @admin.display(description="أساسي", ordering="is_system")
    def get_is_system(self, obj):
        if obj.is_system:
            return mark_safe(
                '<span class="icon-circle-check">'
                '<svg width="18" height="18" viewBox="0 0 24 24">'
                '<circle cx="12" cy="12" r="9" fill="#22c55e"/>'
                '<path d="M8 12l3 3 5-5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
                '</svg>'
                '</span>'
            )
        return "-"

    @admin.display(description="حذف")
    def get_delete(self, obj):
        url = reverse('admin:accounts_role_delete', args=[obj.pk])
        return format_html(
            '<a href="{}" class="admin-trash-btn" title="حذف">'
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
            '<polyline points="3 6 5 6 21 6"></polyline>'
            '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>'
            '</svg>'
            '</a>',
            url
        )


# Unregister default User from auth if registered
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass
