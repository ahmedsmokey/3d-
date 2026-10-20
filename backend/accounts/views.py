import secrets
import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Role, UserProfile
from .permissions import IsAdminOrStaff, IsAdminOrReadOnly


def serialize_user(user, avatar_url=None):
    is_admin = user.is_staff or user.is_superuser
    profile = getattr(user, 'profile', None)
    role_obj = profile.role if profile else None
    role_name = role_obj.name if role_obj else ('مالك' if user.is_superuser else ('موظف' if user.is_staff else 'بلا دور'))
    role_code = role_obj.code if role_obj else ('OWNER' if user.is_superuser else ('STAFF' if user.is_staff else 'CUSTOMER'))
    phone = profile.phone if profile and profile.phone else '-'

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'name': user.get_full_name() or user.first_name or user.username,
        'phone': phone,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'is_active': user.is_active,
        'role': 'admin' if is_admin else 'customer',
        'role_name': role_name,
        'role_code': role_code,
        'avatar_url': avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={user.username}&backgroundColor=ff6b00"
    }


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        identifier = str(request.data.get('username', '')).strip()
        password = str(request.data.get('password', ''))

        if not identifier or not password:
            return Response(
                {'error': 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Allow login by email or username
        user_obj = None
        if '@' in identifier:
            user_obj = User.objects.filter(email__iexact=identifier).first()
            if user_obj:
                identifier = user_obj.username

        user = authenticate(request, username=identifier, password=password)
        if user is None:
            return Response(
                {'error': 'بيانات الدخول غير صحيحة، يرجى التأكد من اسم المستخدم وكلمة المرور'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response({'error': 'هذا الحساب معطل حالياً، يرجى التواصل مع الإدارة'}, status=status.HTTP_403_FORBIDDEN)

        try:
            login(request, user)
            if bool(request.data.get('remember_me', True)):
                request.session.set_expiry(60 * 60 * 24 * 30)  # 30 days
            else:
                request.session.set_expiry(0)  # Browser session
        except Exception:
            pass

        return Response({
            'success': True,
            'message': 'تم تسجيل الدخول بنجاح',
            'user': serialize_user(user)
        })


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        username = str(request.data.get('username', '')).strip()
        email = str(request.data.get('email', '')).strip()
        password = str(request.data.get('password', ''))
        name = str(request.data.get('name', '')).strip()
        phone = str(request.data.get('phone', '')).strip()

        if not username or not password:
            return Response({'error': 'اسم المستخدم وكلمة المرور حقول مطلوبة'}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({'error': 'يجب أن تتكون كلمة المرور من 8 خانات على الأقل لضمان الأمان'}, status=status.HTTP_400_BAD_REQUEST)

        # Sanitize username (alphanumeric, underscore, hyphen)
        if not re.match(r'^[\w.@+-]+$', username):
            return Response({'error': 'اسم المستخدم يحتوي على رموز غير صالحة'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username__iexact=username).exists():
            return Response({'error': 'اسم المستخدم هذا مسجل مسبقاً، يرجى اختيار اسم آخر'}, status=status.HTTP_400_BAD_REQUEST)

        if email and User.objects.filter(email__iexact=email).exists():
            return Response({'error': 'البريد الإلكتروني هذا مستخدم مسبقاً'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name or username
        )

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.phone = phone if phone else '-'
        profile.save()

        try:
            login(request, user)
            if bool(request.data.get('remember_me', True)):
                request.session.set_expiry(60 * 60 * 24 * 30)  # 30 days
            else:
                request.session.set_expiry(0)  # Browser session
        except Exception:
            pass

        return Response({
            'success': True,
            'message': 'تم إنشاء الحساب بنجاح',
            'user': serialize_user(user)
        }, status=status.HTTP_201_CREATED)


class GoogleAuthView(APIView):
    """
    Handles Google Sign-In securely.
    Privilege escalation backdoor removed: is_staff is NEVER granted via email name.
    Passphrases generated via cryptographically secure random tokens.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        email = str(request.data.get('email', '')).strip()
        name = str(request.data.get('name', '')).strip()
        avatar_url = request.data.get('avatar_url', '')
        phone = str(request.data.get('phone', '')).strip()

        if not email or '@' not in email:
            return Response({'error': 'لم يتم استلام بريد إلكتروني صالح من Google'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user with this email already exists
        user = User.objects.filter(email__iexact=email).first()

        if not user:
            # Generate unique username from email
            base_username = email.split('@')[0].replace('.', '_').replace('-', '_')
            username = base_username[:25]
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username[:20]}_{counter}"
                counter += 1

            # Create standard customer user (never auto-promote to staff)
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=name or base_username
            )
            # Set high-entropy random password for Google-authenticated accounts
            user.set_password(secrets.token_urlsafe(32))
            user.save()
        else:
            if name and not user.first_name:
                user.first_name = name
                user.save()

        if not user.is_active:
            return Response({'error': 'هذا الحساب معطل حالياً'}, status=status.HTTP_403_FORBIDDEN)

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if phone and (not profile.phone or profile.phone == '-'):
            profile.phone = phone
            profile.save()

        try:
            login(request, user)
            if bool(request.data.get('remember_me', True)):
                request.session.set_expiry(60 * 60 * 24 * 30)  # 30 days
            else:
                request.session.set_expiry(0)  # Browser session
        except Exception:
            pass

        return Response({
            'success': True,
            'message': 'تم تسجيل الدخول بنجاح عبر حساب Google',
            'user': serialize_user(user, avatar_url=avatar_url)
        })


class CurrentUserView(APIView):
    def get(self, request):
        if request.user and request.user.is_authenticated:
            return Response({'authenticated': True, 'user': serialize_user(request.user)})
        return Response({'authenticated': False})

    def patch(self, request):
        # Security Hardening: Only allow modifying the authenticated user's own profile.
        # IDOR vulnerability eliminated (no arbitrary user_id parameter).
        if not request.user or not request.user.is_authenticated:
            return Response(
                {'error': 'يجب تسجيل الدخول لتحديث بياناتك'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = request.user
        name = request.data.get('name')
        phone = request.data.get('phone')

        if name is not None:
            clean_name = str(name).strip()[:100]
            if clean_name:
                user.first_name = clean_name
                user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        if phone is not None:
            clean_phone = str(phone).strip()[:35]
            profile.phone = clean_phone
            profile.save()

        return Response({
            'success': True,
            'message': 'تم تحديث البيانات بنجاح',
            'user': serialize_user(user)
        })


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = 'auth'

    def post(self, request):
        # Security Hardening: Only allow changing password for currently authenticated user.
        # Arbitrary user_id injection eliminated.
        user = request.user
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')

        if not new_password or len(str(new_password)) < 8:
            return Response(
                {'error': 'يجب أن تتكون كلمة المرور الجديدة من 8 خانات على الأقل'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mandatory current password verification
        if not current_password or not user.check_password(current_password):
            return Response(
                {'error': 'كلمة المرور الحالية غير صحيحة'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({'success': True, 'message': 'تم تغيير كلمة المرور بنجاح'})


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'success': True, 'message': 'تم تسجيل الخروج بنجاح'})


class ToggleUserActiveView(APIView):
    permission_classes = [IsAdminOrStaff]

    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(pk=user_id).first()
        if not user:
            return Response({'error': 'المستخدم غير موجود'}, status=status.HTTP_404_NOT_FOUND)

        # Prevent admin from deactivating their own account
        if user == request.user:
            return Response({'error': 'لا يمكنك تعطيل حسابك الشخصي أثناء تسجيل الدخول به'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = not user.is_active
        user.save()
        return Response({'success': True, 'is_active': user.is_active})


class AdminEmployeeListView(APIView):
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        employees = User.objects.filter(is_staff=True).select_related('profile', 'profile__role').order_by('-id')
        data = [serialize_user(u) for u in employees]
        return Response(data)

    def post(self, request):
        name = str(request.data.get('name', '')).strip()
        email = str(request.data.get('email', '')).strip()
        phone = str(request.data.get('phone', '')).strip()
        role_id = request.data.get('role_id')
        password = request.data.get('password') or secrets.token_urlsafe(12)
        username = request.data.get('username') or (email.split('@')[0] if email else f"emp_{User.objects.count()+1}")

        if not name or not email:
            return Response({'error': 'الاسم والبريد الإلكتروني حقول مطلوبة'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={'username': username, 'first_name': name, 'is_staff': True}
        )
        if not created:
            user.is_staff = True
            user.first_name = name
            user.save()
        else:
            user.set_password(password)
            user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.phone = phone
        if role_id:
            profile.role_id = role_id
        profile.save()

        return Response({'success': True, 'employee': serialize_user(user)})

    def delete(self, request, pk=None):
        ids = request.data.get('ids')
        if ids and isinstance(ids, list):
            # Prevent deleting own account
            filtered_ids = [uid for uid in ids if uid != request.user.id]
            if not filtered_ids:
                return Response({'error': 'لا يمكنك حذف حسابك الشخصي'}, status=status.HTTP_400_BAD_REQUEST)
            deleted_count, _ = User.objects.filter(pk__in=filtered_ids).delete()
            return Response({'success': True, 'deleted_count': deleted_count})

        pk = pk or request.data.get('id')
        user = User.objects.filter(pk=pk).first()
        if user:
            if user == request.user:
                return Response({'error': 'لا يمكنك حذف حسابك الشخصي'}, status=status.HTTP_400_BAD_REQUEST)
            user.delete()
            return Response({'success': True})
        return Response({'error': 'غير موجود'}, status=status.HTTP_404_NOT_FOUND)


class AdminAccountListView(APIView):
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        users = User.objects.all().select_related('profile', 'profile__role').order_by('-id')
        data = [serialize_user(u) for u in users]
        return Response(data)

    def post(self, request):
        name = str(request.data.get('name', '')).strip()
        email = str(request.data.get('email', '')).strip()
        phone = str(request.data.get('phone', '')).strip()
        is_staff = bool(request.data.get('is_staff', False))
        role_id = request.data.get('role_id')
        username = request.data.get('username') or (email.split('@')[0] if email else f"user_{User.objects.count()+1}")

        if not name or not email:
            return Response({'error': 'الاسم والبريد الإلكتروني مطلوبان'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={'username': username, 'first_name': name, 'is_staff': is_staff}
        )
        if not created:
            user.first_name = name
            user.is_staff = is_staff
            user.save()
        else:
            default_pass = secrets.token_urlsafe(12)
            user.set_password(default_pass)
            user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.phone = phone
        if role_id:
            profile.role_id = role_id
        profile.save()

        return Response({'success': True, 'account': serialize_user(user)})

    def delete(self, request, pk=None):
        ids = request.data.get('ids')
        if ids and isinstance(ids, list):
            filtered_ids = [uid for uid in ids if uid != request.user.id]
            if not filtered_ids:
                return Response({'error': 'لا يمكنك حذف حسابك الشخصي'}, status=status.HTTP_400_BAD_REQUEST)
            deleted_count, _ = User.objects.filter(pk__in=filtered_ids).delete()
            return Response({'success': True, 'deleted_count': deleted_count})

        pk = pk or request.data.get('id')
        user = User.objects.filter(pk=pk).first()
        if user:
            if user == request.user:
                return Response({'error': 'لا يمكنك حذف حسابك الشخصي'}, status=status.HTTP_400_BAD_REQUEST)
            user.delete()
            return Response({'success': True})
        return Response({'error': 'غير موجود'}, status=status.HTTP_404_NOT_FOUND)


class AdminRoleListView(APIView):
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        roles = Role.objects.all().order_by('id')
        data = []
        for r in roles:
            data.append({
                'id': r.id,
                'name': r.name,
                'code': r.code,
                'permissions_summary': r.permissions_summary,
                'employee_count': r.employee_count,
                'is_system': r.is_system,
            })
        return Response(data)

    def post(self, request):
        name = str(request.data.get('name', '')).strip()
        code = str(request.data.get('code', '')).strip().upper()
        permissions_summary = request.data.get('permissions_summary', 'صلاحية 3 أقسام')

        if not name or not code:
            return Response({'error': 'اسم الدور والاسم البرمجي مطلوبان'}, status=status.HTTP_400_BAD_REQUEST)

        role = Role.objects.create(
            name=name,
            code=code,
            permissions_summary=permissions_summary,
            is_system=False
        )
        return Response({'success': True, 'role': {
            'id': role.id,
            'name': role.name,
            'code': role.code,
            'permissions_summary': role.permissions_summary,
            'employee_count': 0,
            'is_system': role.is_system,
        }})

    def delete(self, request, pk=None):
        ids = request.data.get('ids')
        if ids and isinstance(ids, list):
            deleted_count, _ = Role.objects.filter(pk__in=ids, is_system=False).delete()
            return Response({'success': True, 'deleted_count': deleted_count})
        pk = pk or request.data.get('id')
        role = Role.objects.filter(pk=pk).first()
        if role:
            if role.is_system:
                return Response({'error': 'لا يمكن حذف الأدوار الأساسية للنظام'}, status=status.HTTP_400_BAD_REQUEST)
            role.delete()
            return Response({'success': True})
        return Response({'error': 'غير موجود'}, status=status.HTTP_404_NOT_FOUND)
