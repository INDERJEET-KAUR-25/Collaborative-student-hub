from rest_framework import serializers
from .models import Team, TeamMember

class TeamMemberSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = TeamMember
        fields = ['id', 'user', 'username', 'email', 'joined_at']


class TeamSerializer(serializers.ModelSerializer):
    project_title = serializers.ReadOnlyField(source='project.title')
    members = TeamMemberSerializer(source='teammember_set', many=True, read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'name', 'project', 'project_title', 'created_at', 'members']