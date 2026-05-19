from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer
from listings.serializers import ListingSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    listing_detail = ListingSerializer(source='listing', read_only=True)
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'listing', 'quantity', 'price', 'product_detail', 'listing_detail']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = Order
        fields = ['id', 'user', 'user_name', 'created_at', 'status', 'total_price', 'items']
        read_only_fields = ['user', 'total_price']