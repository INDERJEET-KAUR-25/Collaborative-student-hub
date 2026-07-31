from django.db import models
from django.conf import settings

# Create your models here.

class Project(models.Model):
    DIFFICULTY_CHOICES=[
        ('Beginner','Beginner'),
        ('Intermediate','Intermediate'),
        ('Advanced','Advanced'),
    ]

    STATUS_CHOICES=[
        ('Open','Open'),
        ('In Progress','In Progress'),
        ('Completed','Completed'),
        ('Terminated','Terminated'),
    ]

    # Columns for project model

    title=models.CharField(max_length=300)
    description=models.TextField()
    owner=models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_projects')
    department=models.CharField(max_length=150)
    deadline=models.DateField()
    status=models.CharField(max_length=20,default='Open',choices=STATUS_CHOICES)
    difficulty=models.CharField(max_length=20,default='Beginner',choices=DIFFICULTY_CHOICES)
    team_size=models.PositiveIntegerField(default=1)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ProjectSkill(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='required_skills')
    skill_name = models.CharField(max_length=100)  # Stores skill name directly (e.g., "Python", "Django")

    class Meta:
        unique_together = ('project', 'skill_name')

    def __str__(self):
        return f"{self.skill_name} for {self.project.title}"