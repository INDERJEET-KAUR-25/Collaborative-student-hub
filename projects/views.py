from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Project
from .serializers import ProjectSerializer

@api_view(['GET','POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def project_list_create(request):
    #GET: List all projects with optional filtering (department, status, difficulty, search).
    #POST: Create a new project (Authenticated user only).
    if request.method=='GET':
        projects=Project.objects.all().order_by('-created_at')

        # Extract search and filter query parameter
        department=request.query_params.get('department')
        project_status=request.query_params.get('status')
        difficulty=request.query_params.get('difficulty')
        owner_id=request.query_params.get('owner')
        search=request.query_params.get('search')

        if department:
            projects=projects.filter(department__iexact=department)
        if project_status:
            projects=projects.filter(status__iexact=project_status)
        if difficulty:
            projects=projects.filter(difficulty__iexact=difficulty)
        if owner_id:
            projects=projects.filter(owner_id=owner_id)
        if search:
            projects = projects.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(required_skills__skill_name__icontains=search)
            ).distinct()

        serializer=ProjectSerializer(projects,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

    elif request.method=='POST':
        serializer=ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer._errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET','PUT','DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def project_detail(request,pk):
    #GET: Retrieve a single project by ID.
    #PUT: Update a project (Owner only).
    #DELETE: Delete a project (Owner only).

    project = get_object_or_404(Project, pk=pk)

    if request.method == 'GET':
        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        if project.owner != request.user:
            return Response({'detail': 'You do not have permission to edit this project.'}, status=status.HTTP_403_FORBIDDEN)
        
        old_status = project.status
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            updated_project = serializer.save()
            
            # Notify all team members when project status changes
            new_status = updated_project.status
            if new_status != old_status and new_status in ('Completed', 'Terminated', 'In Progress'):
                from notifications.models import Notification
                from teams.models import Team
                try:
                    team = Team.objects.get(project=updated_project)
                    for member in team.members.all():
                        if member.student != request.user:
                            Notification.objects.create(
                                user=member.student,
                                message=f"Project '{updated_project.title}' has been marked as '{new_status}' by the owner."
                            )
                except Team.DoesNotExist:
                    pass
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if project.owner != request.user:
            return Response({'detail': 'You do not have permission to delete this project.'}, status=status.HTTP_403_FORBIDDEN)
            
        project.delete()
        return Response({'detail': 'Project deleted successfully.'}, status=status.HTTP_24_NO_CONTENT)
