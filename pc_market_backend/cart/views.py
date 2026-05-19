from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from products.models import Product
from listings.models import Listing

class CartViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CartSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    def list(self, request):
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart = self.get_object()
        product_id = request.data.get('product_id')
        listing_id = request.data.get('listing_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id and not listing_id:
            return Response({'error': 'Необходимо указать product_id или listing_id'}, status=400)

        if product_id:
            product = Product.objects.get(id=product_id)
            item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={'quantity': quantity})
            if not created:
                item.quantity += quantity
                item.save()
        else:
            listing = Listing.objects.get(id=listing_id)
            item, created = CartItem.objects.get_or_create(cart=cart, listing=listing, defaults={'quantity': quantity})
            if not created:
                item.quantity += quantity
                item.save()
        return Response({'status': 'товар добавлен'})

    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        item_id = request.data.get('item_id')
        cart = self.get_object()
        CartItem.objects.filter(id=item_id, cart=cart).delete()
        return Response({'status': 'удалено'})

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        cart = self.get_object()
        cart.items.all().delete()
        return Response({'status': 'корзина очищена'})