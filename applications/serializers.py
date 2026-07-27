from rest_framework import serializers
from .models import Application

class ApplicationSerializer(serializers.ModelSerializer):
    applicant_name=serializers.ReadOnlyField(source='applicant.username')
    project_title=serializers.ReadOnlyField(source='project.title')

    class Meta:
        model=Application
        fields=[
            'id', 'project', 'project_title', 'applicant', 
            'applicant_name', 'cover_letter', 'status', 'created_at'
        ]
        read_only_fields = ['applicant', 'created_at']