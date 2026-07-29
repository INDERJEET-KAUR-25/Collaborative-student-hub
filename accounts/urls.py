from django.urls import path
from .views import (
    register_view,
    logout_view,
    JWTObtainPairView,
    JWTRefreshView,
    profile_view,
    students_list,
    skill_list_create,
    skill_detail,
)

urlpatterns = [
    path('register/', register_view, name='register'),
    path('login/', JWTObtainPairView, name='token_obtain_pair'),
    path('token/refresh/', JWTRefreshView, name='token_refresh'),
    path('logout/', logout_view, name='logout'),
    path('profile/', profile_view, name='profile'),
    path('students/', students_list, name='students_list'),
    path('skills/', skill_list_create, name='skill_list_create'),
    path('skills/<int:pk>/', skill_detail, name='skill_detail'),
]
