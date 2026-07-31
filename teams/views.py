from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Team, TeamMember
from .serializers import TeamSerializer, TeamMemberSerializer

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def team_detail_by_project(request, project_id):
    
    #GET: Retrieve team details and all members for a specific project.
    
    team = get_object_or_404(Team, project_id=project_id)
    serializer = TeamSerializer(team)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_teams(request):
    
    #GET: List all teams the current logged-in user belongs to.
    
    teams = Team.objects.filter(teammember__student=request.user).distinct()
    serializer = TeamSerializer(teams, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_team_member(request, team_id, member_id):
    
    #DELETE: Remove a member from a team (Only the Project Owner can perform this).
    
    team = get_object_or_404(Team, id=team_id)

    # Check if request user is the owner of the project
    if request.user != team.project.owner:
        return Response(
            {'detail': 'Only the project owner can remove team members.'}, 
            status=status.HTTP_403_FORBIDDEN
        )

    member_record = get_object_or_404(TeamMember, team=team, user_id=member_id)
    member_record.delete()
    return Response({'detail': 'Member removed from team successfully.'}, status=status.HTTP_204_NO_CONTENT)