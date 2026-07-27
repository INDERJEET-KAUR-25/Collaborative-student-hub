from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.ReadOnlyField(source='recipient.username')

    class Meta:
        model = Notification
        fields = [
            'id', 
            'recipient', 
            'recipient_name', 
            'message', 
            'is_read', 
            'created_at'
        ]
        read_only_fields = ['id', 'recipient', 'created_at']