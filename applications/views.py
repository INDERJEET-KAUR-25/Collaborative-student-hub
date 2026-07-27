from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Application
from .serializers import ApplicationSerializer
from teams.models import Team, TeamMember

# Create your views here.


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def application_list_create(request):
    
    #GET: List applications (filter by ?project_id=X or default to user's own applications).
    #POST: Submit a new application for a project.
    
    if request.method == 'GET':
        project_id = request.query_params.get('project')
        if project_id:
            # Applications for a specific project (owner view)
            applications = Application.objects.filter(project_id=project_id)
        else:
            # Applications submitted by the current user
            applications = Application.objects.filter(applicant=request.user)
            
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = ApplicationSerializer(data=request.data)
        if serializer.is_valid():
            # Prevent applying twice to the same project
            project = serializer.validated_data['project']
            if Application.objects.filter(project=project, applicant=request.user).exists():
                return Response(
                    {'detail': 'You have already applied to this project.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            serializer.save(applicant=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def application_detail_update(request, pk):
    
    #GET: View single application.
    #PUT: Update status ('Accepted', 'Rejected') - Project owner only.
    #Auto-creates Team & TeamMember entries upon 'Accepted'.
    
    application = get_object_or_404(Application, pk=pk)

    if request.method == 'GET':
        # Only applicant or project owner can view
        if request.user != application.applicant and request.user != application.project.owner:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = ApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        # Only project owner can update application status
        if request.user != application.project.owner:
            return Response({'detail': 'Only project owner can update status.'}, status=status.HTTP_403_FORBIDDEN)

        old_status = application.status
        serializer = ApplicationSerializer(application, data=request.data, partial=True)
        
        if serializer.is_valid():
            updated_app = serializer.save()
            new_status = updated_app.status

            #  AUTOMATIC TEAM CREATION TRIGGER 
            if old_status != 'Accepted' and new_status == 'Accepted':
                # Get or create the project team
                team, created = Team.objects.get_or_create(
                    project=updated_app.project,
                    defaults={'name': f"Team {updated_app.project.title}"}
                )
                # Add accepted applicant to the team
                TeamMember.objects.get_or_create(
                    team=team,
                    user=updated_app.applicant
                )

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
