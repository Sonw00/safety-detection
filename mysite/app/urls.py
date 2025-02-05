from django.urls import path
from .views import signup, user_login, user_logout, check_login, get_csrf_token

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', user_login, name='login'),
    path('logout/', user_logout, name='logout'),
    path('check_login/', check_login, name='check_login'),
    path('csrf_token/', get_csrf_token, name='csrf_token'),
]