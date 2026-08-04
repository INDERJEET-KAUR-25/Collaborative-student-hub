from django.urls import path
from . import views

urlpatterns = [
    path('', views.project_list_create, name='project-list-create'),
    path('<int:pk>/', views.project_detail, name='project-detail'),
    ]
