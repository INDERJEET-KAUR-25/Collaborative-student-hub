from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Application
from .serializers import ApplicationSerializer
from teams.models import Team, TeamMember
from projects.models import Project

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
            project = get_object_or_404(Project, pk=project_id)
            if request.user != project.owner:
                return Response(
                    {'detail': 'Only the project owner can view incoming applications.'},
                    status=status.HTTP_403_FORBIDDEN,
                )
            applications = Application.objects.filter(project=project)
        else:
            # Applications submitted by the current user
            applications = Application.objects.filter(student=request.user)
            
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = ApplicationSerializer(data=request.data)
        if serializer.is_valid():
            # Prevent applying twice to the same project
            project = serializer.validated_data['project']
            if Application.objects.filter(project=project, student=request.user).exists():
                return Response(
                    {'detail': 'You have already applied to this project.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Compulsory tech stack requirement check (OR condition: user needs at least one matching skill)
            from accounts.models import Profile
            profile, _ = Profile.objects.get_or_create(user=request.user)
            project_skills = list(project.required_skills.values_list('skill_name', flat=True))
            
            if project_skills:
                user_skills = set(profile.skills.values_list('name', flat=True))
                user_skills_lower = {s.strip().lower() for s in user_skills}
                project_skills_lower = {s.strip().lower() for s in project_skills}
                
                has_at_least_one = bool(project_skills_lower & user_skills_lower)
                if not has_at_least_one:
                    return Response(
                        {'detail': f"You must have at least one of the required tech stack skills to apply: {', '.join(project_skills)}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            application = serializer.save(student=request.user)
            
            # TRIGGER NOTIFICATION TO PROJECT OWNER
            from notifications.models import Notification
            Notification.objects.create(
                user=project.owner,
                message=f"{request.user.username} has applied to join your project '{project.title}'."
            )

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
        if request.user != application.student and request.user != application.project.owner:
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

            # Trigger notification to applicant when status is updated
            if old_status != new_status:
                from notifications.models import Notification
                Notification.objects.create(
                    user=updated_app.student,
                    message=f"Your application for the project '{updated_app.project.title}' has been {new_status}."
                )

            #  AUTOMATIC TEAM CREATION TRIGGER 
            if old_status != 'Accepted' and new_status == 'Accepted':
                # Get or create the project team
                team, created = Team.objects.get_or_create(
                    project=updated_app.project,
                    defaults={'name': f"Team {updated_app.project.title}"}
                )
                # Add accepted student to the team
                TeamMember.objects.get_or_create(
                    team=team,
                    student=updated_app.student
                )

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
