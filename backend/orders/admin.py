from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'unit_price']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer_name', 'customer_phone', 'city', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'customer_name', 'customer_email', 'customer_phone']
    inlines = [OrderItemInline]
