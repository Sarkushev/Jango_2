from rest_framework import viewsets, permissions
from .models import Listing
from .serializers import ListingSerializer

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.filter(is_active=True)
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def perform_update(self, serializer):
        # Проверка, что пользователь - владелец или админ
        if serializer.instance.seller != self.request.user and not self.request.user.is_staff:
            raise PermissionError("Вы не можете редактировать чужое объявление")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.seller != self.request.user and not self.request.user.is_staff:
            raise PermissionError("Вы не можете удалять чужое объявление")
        instance.delete()