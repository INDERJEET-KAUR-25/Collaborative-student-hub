from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


from .models import Profile


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = __import__('accounts.models', fromlist=['Skill']).Skill
        fields = ('id', 'name')


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')

    class Meta:
        model = Profile
        fields = (
            'id', 'user', 'department', 'year', 'bio', 'github',
            'linkedin', 'availability', 'interests', 'resume', 'created_at'
        )
        read_only_fields = ('id', 'user', 'created_at')
