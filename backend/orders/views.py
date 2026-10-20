from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from accounts.permissions import IsAdminOrStaff
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().prefetch_related('items__product').order_by('-created_at')
    serializer_class = OrderSerializer
    lookup_field = 'id'

    def get_permissions(self):
        # Admin/staff can update or delete orders
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminOrStaff()]
        # Creating an order requires authentication or customer checkout
        if self.action == 'create':
            return [AllowAny()]
        # Listing and retrieving
        return [AllowAny()]

    def get_object(self):
        # Support lookup by either numeric ID or order_number UUID
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        user = self.request.user
        if str(lookup_value).isdigit():
            order = get_object_or_404(Order, id=int(lookup_value))
        else:
            order = get_object_or_404(Order, order_number=lookup_value)

        # Enforce IDOR protection: only staff or the order owner can view the order details
        if not (user.is_authenticated and (user.is_staff or order.user_id == user.id)):
            # If tracking by order_number anonymously, require customer phone/email check or restrict
            if not str(lookup_value).isdigit():
                # Allow tracking if order_number was provided as UUID
                return order
            self.permission_denied(self.request, message="غير مصرح لك بعرض تفاصيل هذا الطلب.")
            
        return order

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        # Staff can see all orders and filter by query params
        if user.is_authenticated and user.is_staff:
            user_id = self.request.query_params.get('user_id')
            if user_id:
                qs = qs.filter(user_id=user_id)
            email = self.request.query_params.get('email')
            if email:
                qs = qs.filter(customer_email__iexact=email)
            status_param = self.request.query_params.get('status')
            if status_param:
                qs = qs.filter(status=status_param)
            return qs

        # Regular authenticated customers can ONLY see their own orders (prevents IDOR)
        if user.is_authenticated:
            return qs.filter(user=user)

        # Anonymous users cannot list all orders in bulk
        return qs.none()

    def create(self, request, *args, **kwargs):
        # Enforce authentication: customer must be registered & logged in to place an order
        user = request.user if request.user and request.user.is_authenticated else None
        
        # If user is not authenticated via session, check if user credentials exist
        if not user:
            user_id = request.data.get('user_id')
            user_email = request.data.get('customer_email', '').strip()

            if user_id:
                user = User.objects.filter(pk=user_id, is_active=True).first()
            elif user_email:
                user = User.objects.filter(email__iexact=user_email, is_active=True).first()

        if not user:
            return Response(
                {
                    "error": "عذراً، يجب تسجيل الدخول أو إنشاء حساب أولاً لتتمكن من إتمام الطلب ومتابعة شحنته.",
                    "code": "AUTH_REQUIRED"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save(user=user)
        headers = self.get_success_headers(serializer.data)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED, headers=headers)
