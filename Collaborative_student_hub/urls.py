"""
URL configuration for Collaborative_student_hub project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include


def home(request):
    return HttpResponse("<h1>Collaborative Student Hub</h1><p>The frontend is being served separately. Open the Vite app at http://localhost:5173/</p>")


urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/projects/', include('projects.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/auth/', include('accounts.urls')),
    path('api/teams/', include('teams.urls')),
]
