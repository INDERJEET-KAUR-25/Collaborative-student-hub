from django.db import models
from django.conf import settings


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    department = models.CharField(max_length=150, blank=True)
    year = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    github = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    availability = models.CharField(max_length=100, blank=True)
    interests = models.TextField(blank=True)
    resume = models.URLField(blank=True)
    skills = models.ManyToManyField('Skill', blank=True, related_name='profiles')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile for {self.user.username}"


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

