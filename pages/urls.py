from django.urls import path
from . import views

urlpatterns = [
    path('login', views.login, name='login'),
    path('SignUp', views.signup, name='SignUp'),
    path('index', views.index, name='index'),
]