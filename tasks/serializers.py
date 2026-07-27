from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.username')
    created_by_name = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Task
        fields = [
            'id', 'project', 'title', 'description', 
            'assigned_to', 'assigned_to_name', 
            'created_by', 'created_by_name', 
            'status', 'due_date', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']