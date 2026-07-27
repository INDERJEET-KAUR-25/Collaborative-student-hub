from django.urls import path
from .import views

urlpatterns=[
    path('applications/',views.application_list_create,name='application_list_create'),
    path('applications/<int:pk>/',views.application_detail_update,name='application_detail_update'),
]