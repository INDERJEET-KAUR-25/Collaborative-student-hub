from django.db import models
from django.conf import settings
from projects.models import Project

class Team(models.Model):
    name = models.CharField(max_length=255, blank=True)
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='team')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or f"Team for {self.project.title}"

class TeamMember(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teams_joined')
    role = models.CharField(max_length=100, default='Contributor')

    class Meta:
        unique_together = ('team', 'student')

    def __str__(self):
        return f"{self.student} in {self.team.project.title}"