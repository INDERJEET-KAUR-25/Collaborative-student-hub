from rest_framework import serializers
from .models import Team, TeamMember

class TeamMemberSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='student.username')
    email = serializers.ReadOnlyField(source='student.email')

    class Meta:
        model = TeamMember
        fields = ['id', 'student', 'username', 'email', 'role']


class TeamSerializer(serializers.ModelSerializer):
    project_title = serializers.ReadOnlyField(source='project.title')
    members = TeamMemberSerializer(source='members', many=True, read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'name', 'project', 'project_title', 'created_at', 'members']