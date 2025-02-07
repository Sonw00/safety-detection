from django.urls import path
from .views import signup, user_login, user_logout, check_login, get_csrf_token, check_id, user_info, update_user_status, get_user_status,update_user_posture,get_user_posture

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', user_login, name='login'),
    path('logout/', user_logout, name='logout'),
    path('check_login/', check_login, name='check_login'),
    path('csrf_token/', get_csrf_token, name='csrf_token'),
    path('check_id/', check_id, name='check_id'),
    path('user_info/', user_info, name='user_info'),
    path('update_status/', update_user_status, name='update_user_status'),
    path('get_status/', get_user_status, name='get_user_status'),
    path('update_posture/', update_user_posture, name='update_user_posture'),
    path('get_posture/', get_user_posture, name='get_user_posture'),
]