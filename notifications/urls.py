from django.urls import path
from . import views

urlpatterns = [
    path('notifications/', views.user_notifications, name='user_notifications'),
]