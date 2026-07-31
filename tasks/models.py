from django.db import models
from django.conf import settings
from teams.models import Team

class Task(models.Model):
    STATUS_CHOICES = [
        ('To_do', 'To_do'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='To_do')
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title