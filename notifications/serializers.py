from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'user_name',
            'message',
            'is_read',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']