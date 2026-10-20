from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product

class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class OrderItemSerializer(serializers.ModelSerializer):
    product_name_en = serializers.CharField(source='product.name_en', read_only=True)
    product_name_ar = serializers.CharField(source='product.name_ar', read_only=True)
    product_image = serializers.CharField(source='product.image_url', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name_en', 'product_name_ar', 'product_image', 'quantity', 'unit_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    cart_items = OrderItemInputSerializer(many=True, write_only=True, required=False)
    username = serializers.CharField(source='user.username', read_only=True, default='')

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'username', 'customer_name', 'customer_email',
            'customer_phone', 'shipping_address', 'city', 'notes',
            'total_amount', 'status', 'created_at', 'items', 'cart_items'
        ]
        read_only_fields = ['order_number', 'total_amount', 'created_at', 'user']

    def create(self, validated_data):
        cart_items_data = validated_data.pop('cart_items', [])
        if not cart_items_data:
            raise serializers.ValidationError({"cart_items": "Cart items are required for new orders."})
        
        # Calculate total and verify products
        total_amount = 0
        items_to_create = []

        for item_data in cart_items_data:
            try:
                product = Product.objects.get(id=item_data['product_id'])
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product with id {item_data['product_id']} does not exist.")

            subtotal = product.price * item_data['quantity']
            total_amount += subtotal
            items_to_create.append({
                'product': product,
                'quantity': item_data['quantity'],
                'unit_price': product.price
            })

            # Decrease stock if available
            if product.stock_quantity >= item_data['quantity']:
                product.stock_quantity -= item_data['quantity']
                product.save(update_fields=['stock_quantity'])

        order = Order.objects.create(total_amount=total_amount, **validated_data)

        for item in items_to_create:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                quantity=item['quantity'],
                unit_price=item['unit_price']
            )

        return order

    def update(self, instance, validated_data):
        # Allow updating status, customer details, notes etc.
        for attr, value in validated_data.items():
            if attr != 'cart_items':
                setattr(instance, attr, value)
        instance.save()
        return instance
