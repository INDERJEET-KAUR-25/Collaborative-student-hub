from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import NotificationSerializer

# Create your views here.

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_notifications(request):
    """
    GET: List all notifications for the authenticated user.
    PUT: Mark all or a specific notification as read.
    """
    if request.method == 'GET':
        notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        notification_id = request.data.get('notification_id')
        if notification_id:
            notification = get_object_or_404(Notification, id=notification_id, recipient=request.user)
            notification.is_read = True
            notification.save()
        else:
            # Mark all as read
            Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)

        return Response({'detail': 'Notifications updated.'}, status=status.HTTP_200_OK)