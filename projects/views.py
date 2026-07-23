from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Project
from .serializers import ProjectSerializer

class ProjectListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        projects = Project.objects.all().order_by('-created_at')

        # Custom filtering via query params
        department = request.query_params.get('department')
        status_param = request.query_params.get('status')
        difficulty = request.query_params.get('difficulty')
        search = request.query_params.get('search')

        if department:
            projects = projects.filter(department__iexact=department)
        if status_param:
            projects = projects.filter(status__iexact=status_param)
        if difficulty:
            projects = projects.filter(difficulty__iexact=difficulty)
        if search:
            projects = projects.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) | 
                Q(required_skills__skill_name__icontains=search)
            ).distinct()

        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        return get_object_or_404(Project, pk=pk)

    def get(self, request, pk):
        project = self.get_object(pk)
        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        project = self.get_object(pk)
        
        # Check ownership permission
        if project.owner != request.user:
            return Response({'detail': 'You do not have permission to edit this project.'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = self.get_object(pk)
        
        # Check ownership permission
        if project.owner != request.user:
            return Response({'detail': 'You do not have permission to delete this project.'}, status=status.HTTP_403_FORBIDDEN)
            
        project.delete()
        return Response({'detail': 'Project deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)