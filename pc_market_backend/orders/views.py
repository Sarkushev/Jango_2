from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import Cart

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)

    def perform_create(self, serializer):
        # Создание заказа из корзины
        cart = Cart.objects.get(user=self.request.user)
        if not cart.items.exists():
            raise serializers.ValidationError("Корзина пуста")
        total = 0
        order = serializer.save(user=self.request.user, total_price=0)
        for item in cart.items.all():
            price = item.product.price if item.product else item.listing.price
            OrderItem.objects.create(
                order=order,
                product=item.product,
                listing=item.listing,
                quantity=item.quantity,
                price=price
            )
            total += price * item.quantity
        order.total_price = total
        order.save()
        # Очищаем корзину
        cart.items.all().delete()

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        if not request.user.is_staff:
            return Response({'error': 'Только админ'}, status=403)
        new_status = request.data.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            return Response({'status': 'обновлен'})
        return Response({'error': 'неверный статус'}, status=400)