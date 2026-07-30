from rest_framework import serializers
from .models import Application

class ApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    project_title = serializers.ReadOnlyField(source='project.title')
    cover_letter = serializers.CharField(source='message', allow_blank=True, required=False)

    class Meta:
        model = Application
        fields = [
            'id', 'project', 'project_title', 'student',
            'student_name', 'cover_letter', 'status', 'created_at'
        ]
        read_only_fields = ['student', 'created_at']