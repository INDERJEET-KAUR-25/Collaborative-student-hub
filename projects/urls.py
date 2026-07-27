from django.urls import path
from . import views

urlpatterns = [
    path('projects/', views.project_list_create, name='project-list-create'),
    path('projects/<int:pk>/', views.project_detail, name='project-detail'),
    ]