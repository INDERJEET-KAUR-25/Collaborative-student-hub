from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, ProfileSerializer, UserSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import Profile
from .models import Skill
from django.shortcuts import get_object_or_404
from django.db.models import Q


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'detail': 'User created successfully.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    
    return Response({'detail': 'Successfully logged out (client should discard tokens).'}, status=status.HTTP_200_OK)



JWTObtainPairView = TokenObtainPairView.as_view()
JWTRefreshView = TokenRefreshView.as_view()


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):

    profile, created = Profile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        # Allow updating profile fields and optionally set skills via a list of names
        skills_list = request.data.get('skills', None)
        # Remove skills from data passed to serializer to avoid write errors
        data = request.data.copy()
        if 'skills' in data:
            data.pop('skills')

        serializer = ProfileSerializer(profile, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()

            if skills_list is not None:
                skill_objs = []
                for name in skills_list:
                    name = name.strip()
                    if not name:
                        continue
                    skill_obj, _ = Skill.objects.get_or_create(name=name)
                    skill_objs.append(skill_obj)
                profile.skills.set(skill_objs)

            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def students_list(request):
    
    department = request.query_params.get('department')
    year = request.query_params.get('year')
    search = request.query_params.get('search')

    profiles = Profile.objects.select_related('user').all()

    if department:
        profiles = profiles.filter(department__iexact=department)
    if year:
        profiles = profiles.filter(year__iexact=year)
    if search:
        profiles = profiles.filter(
            Q(user__username__icontains=search) |
            Q(interests__icontains=search) |
            Q(bio__icontains=search)
        ).distinct()

    serializer = ProfileSerializer(profiles, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def skill_list_create(request):
    if request.method == 'GET':
        skills = Skill.objects.all().order_by('name')
        serializer = ProfileSerializer.__class__
        # Using a dedicated serializer for skills
        from .serializers import SkillSerializer
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        from .serializers import SkillSerializer
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def skill_detail(request, pk):
    skill = get_object_or_404(Skill, pk=pk)
    from .serializers import SkillSerializer
    if request.method == 'GET':
        serializer = SkillSerializer(skill)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = SkillSerializer(skill, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        skill.delete()
        return Response({'detail': 'Skill deleted.'}, status=status.HTTP_204_NO_CONTENT)
