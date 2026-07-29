from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.username')

    class Meta:
        model = Task
        fields = [
            'id', 'team', 'title', 'description', 
            'assigned_to', 'assigned_to_name', 
            'status', 'deadline', 'created_at'
        ]
        read_only_fields = ['created_at']