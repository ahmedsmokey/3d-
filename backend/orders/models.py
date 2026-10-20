import uuid
from django.db import models
from django.contrib.auth.models import User
from products.models import Product

class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Confirmation'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]

    order_number = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=50)
    shipping_address = models.TextField()
    city = models.CharField(max_length=100)
    notes = models.TextField(blank=True)
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number[:8]} - {self.customer_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product.name_en}"
