from django.urls import path
from . import views

urlpatterns = [
    path('teams/my-teams/', views.my_teams, name='my-teams'),
    path('teams/project/<int:project_id>/', views.team_detail_by_project, name='team-detail-by-project'),
    path('teams/<int:team_id>/members/<int:member_id>/', views.remove_team_member, name='remove-team-member'),
]