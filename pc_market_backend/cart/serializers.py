from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductSerializer
from listings.serializers import ListingSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    listing_detail = ListingSerializer(source='listing', read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'listing', 'quantity', 'product_detail', 'listing_detail', 'total_price']

    def get_total_price(self, obj):
        if obj.product:
            return obj.product.price * obj.quantity
        return obj.listing.price * obj.quantity

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_cart_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_cart_price']

    def get_total_cart_price(self, obj):
        total = 0
        for item in obj.items.all():
            if item.product:
                total += item.product.price * item.quantity
            else:
                total += item.listing.price * item.quantity
        return total