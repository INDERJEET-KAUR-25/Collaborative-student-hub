
from django.urls import path
from . import views

urlpatterns = [
    path('', views.application_list_create, name='application_list_create'),
    path('<int:pk>/', views.application_detail_update, name='application_detail_update'),
]
