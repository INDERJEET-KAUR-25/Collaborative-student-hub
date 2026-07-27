from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Task
from .serializers import TaskSerializer

# Create your views here.

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list_create(request):
    
    #GET: List tasks (filter by ?project_id=X or ?assigned_to=me).
    #POST: Create a new task within a project.
    
    if request.method == 'GET':
        project_id = request.query_params.get('project')
        assigned_me = request.query_params.get('assigned')

        tasks = Task.objects.all().order_by('-created_at')

        if project_id:
            tasks = tasks.filter(project_id=project_id)
        if assigned_me == 'true':
            tasks = tasks.filter(assigned_to=request.user)

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            task = serializer.save(created_by=request.user)

            #TRIGGER NOTIFICATION IF ASSIGNED TO SOMEONE ELSE
            if task.assigned_to and task.assigned_to != request.user:
                from notifications.models import Notification
                Notification.objects.create(
                    recipient=task.assigned_to,
                    message=f"You have been assigned a new task: '{task.title}'"
                )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):
    
    #GET: Retrieve a single task.
    #PUT: Update status or task details.
    #DELETE: Delete a task.
    
    task = get_object_or_404(Task, pk=pk)

    if request.method == 'GET':
        serializer = TaskSerializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        old_assignee = task.assigned_to
        serializer = TaskSerializer(task, data=request.data, partial=True)

        if serializer.is_valid():
            updated_task = serializer.save()

            # TRIGGER NOTIFICATION IF ASSIGNEE CHANGED 
            if updated_task.assigned_to and updated_task.assigned_to != old_assignee and updated_task.assigned_to != request.user:
                from notifications.models import Notification
                Notification.objects.create(
                    recipient=updated_task.assigned_to,
                    message=f"You have been assigned to the task: '{updated_task.title}'"
                )

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        task.delete()
        return Response({'detail': 'Task deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)