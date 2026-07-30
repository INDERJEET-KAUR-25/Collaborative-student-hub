from rest_framework import serializers
from .models import Project, ProjectSkill

class ProjectSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source='owner.username')
    skills = serializers.SerializerMethodField()
    skills_list = serializers.ListField(
        child=serializers.CharField(max_length=100), write_only=True, required=False
    )

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'owner', 'owner_name',
            'department', 'deadline', 'status', 'difficulty',
            'team_size', 'created_at', 'skills', 'skills_list'
        ]
        read_only_fields = ['owner', 'created_at']

    def get_skills(self, obj):
        # Returns a simple list of required skill names
        return [skill.skill_name for skill in obj.required_skills.all()]

    def create(self, validated_data):
        skills_data = validated_data.pop('skills_list', [])
        project = Project.objects.create(**validated_data)
        for skill_name in skills_data:
            ProjectSkill.objects.create(project=project, skill_name=skill_name)
        return project

    def update(self, instance, validated_data):
        skills_data = validated_data.pop('skills_list', None)
        
        # Update standard project fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update required skills if provided
        if skills_data is not None:
            instance.required_skills.all().delete()  # Clear existing
            for skill_name in skills_data:
                ProjectSkill.objects.create(project=instance, skill_name=skill_name)

        return instance