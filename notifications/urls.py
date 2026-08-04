from django.urls import path
from . import views

urlpatterns = [
    path('', views.user_notifications, name='user_notifications'),
]
