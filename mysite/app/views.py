from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password, check_password
from django.http import JsonResponse
from django.middleware.csrf import get_token
from .models import User
import json

# 회원가입 기능
def signup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        id = data.get('id')
        password = data.get('password')
        name = data.get('name')
        age = data.get('age')
        address = data.get('address')
        detailed_address = data.get('detailed_address', '')
        phone_num = data.get('phone_num')
        guard_name = data.get('guard_name', '')
        guard_phone_num = data.get('guard_phone_num', '')
        
        # ID 중복 체크
        if User.objects.filter(id=id).exists():
            return JsonResponse({'message': '이미 존재하는 아이디입니다.'}, status=400)

        # 회원 저장
        user = User.objects.create(
            id=id,
            password=make_password(password),  # 비밀번호 해싱
            name=name,
            age=age,
            address=address,
            detailed_address=detailed_address,
            phone_num=phone_num,
            guard_name=guard_name,
            guard_phone_num=guard_phone_num
        )
        return JsonResponse({'message': '회원가입이 완료되었습니다.'}, status=201)

    return JsonResponse({'message': '잘못된 요청입니다.'}, status=400)


# 로그인 기능
def user_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        id = data.get('id')
        password = data.get('password')

        try:
            user = User.objects.get(id=id)
            if check_password(password, user.password):  # 비밀번호 확인
                request.session['user_id'] = user.id  # 세션 저장
                return JsonResponse({'message': '로그인 성공'}, status=200)
            else:
                return JsonResponse({'message': '비밀번호가 틀렸습니다.'}, status=400)
        except User.DoesNotExist:
            return JsonResponse({'message': '존재하지 않는 아이디입니다.'}, status=400)

    return JsonResponse({'message': '잘못된 요청입니다.'}, status=400)


# 로그아웃 기능
def user_logout(request):
    if request.method == 'POST':
        request.session.flush()  # 세션 초기화
        return JsonResponse({'message': '로그아웃 완료'}, status=200)

    return JsonResponse({'message': '잘못된 요청입니다.'}, status=400)


# 로그인 상태 확인 기능
def check_login(request):
    is_logged_in = 'user_id' in request.session
    return JsonResponse({'is_logged_in': is_logged_in})


# CSRF 토큰을 반환하는 뷰
def get_csrf_token(request):
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})