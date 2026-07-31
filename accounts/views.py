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
    # Peer Finder passes a user_id when a visitor opens another student's
    # profile. Without it, this remains the logged-in user's own profile.
    target_user_id = request.query_params.get('user_id')
    if target_user_id:
        profile = get_object_or_404(
            Profile.objects.select_related('user'),
            user_id=target_user_id,
        )
    else:
        profile, _ = Profile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        if target_user_id:
            return Response(
                {'detail': 'You can only update your own profile.'},
                status=status.HTTP_403_FORBIDDEN,
            )
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


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def peer_review_list_create(request):
    from .models import PeerReview
    from .serializers import PeerReviewSerializer

    if request.method == 'GET':
        user_id = request.query_params.get('user_id')
        if user_id:
            reviews = PeerReview.objects.filter(reviewee_id=user_id).order_by('-created_at')
        else:
            reviews = PeerReview.objects.filter(reviewee=request.user).order_by('-created_at')
        serializer = PeerReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        reviewee_id = request.data.get('reviewee')
        if not reviewee_id:
            return Response({'detail': 'Reviewee is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            if int(reviewee_id) == request.user.id:
                return Response({'detail': 'You cannot review yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({'detail': 'Invalid reviewee ID.'}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = PeerReviewSerializer(data=request.data)
        if serializer.is_valid():
            if PeerReview.objects.filter(reviewer=request.user, reviewee_id=reviewee_id).exists():
                return Response({'detail': 'You have already reviewed this peer.'}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save(reviewer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
