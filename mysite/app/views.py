from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password, check_password
from django.http import JsonResponse
from django.middleware.csrf import get_token
from .models import User, UserStatus, UserPosture
import json
import random
from django.utils import timezone

# 사용자 상태 갱신 뷰
def update_user_status(request):
    if request.method == 'POST':
        user_id = request.session.get('user_id')
        if not user_id:
            return JsonResponse({'message': '로그인이 필요합니다.'}, status=403)

        user = User.objects.get(id=user_id)
        status = random.choice([1, 2, 3])
        user_status = UserStatus.objects.create(user=user, status=status, updated_at=timezone.now())
        return JsonResponse({'message': '상태가 갱신되었습니다.', 'status': status, 'updated_at': user_status.updated_at})

    return JsonResponse({'message': '잘못된 요청입니다.'}, status=400)

# 사용자 상태 조회 뷰
def get_user_status(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'message': '로그인이 필요합니다.'}, status=403)

    user = User.objects.get(id=user_id)
    statuses = UserStatus.objects.filter(user=user).order_by('-updated_at')[:10]
    data = [{'status': status.status, 'updated_at': status.updated_at} for status in statuses]
    return JsonResponse({'statuses': data})

# 사용자 자세 갱신 뷰
def update_user_posture(request):
    if request.method == 'POST':
        user_id = request.session.get('user_id')
        if not user_id:
            return JsonResponse({'message': '로그인이 필요합니다.'}, status=403)

        user = User.objects.get(id=user_id)
        posture = random.choice([0, 1, 2, 3, 4, 5, 6])
        user_posture = UserPosture.objects.create(user=user, posture=posture, updated_at=timezone.now())
        return JsonResponse({'message': '자세가 갱신되었습니다.', 'posture': posture, 'updated_at': user_posture.updated_at})

    return JsonResponse({'message': '잘못된 요청입니다.'}, status=400)

# 사용자 자세 조회 뷰
def get_user_posture(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'message': '로그인이 필요합니다.'}, status=403)

    user = User.objects.get(id=user_id)
    postures = UserPosture.objects.filter(user=user).order_by('-updated_at')[:10]
    data = [{'posture': posture.posture, 'updated_at': posture.updated_at} for posture in postures]
    return JsonResponse({'postures': data})

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

# ID 중복 체크 기능
def check_id(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        id = data.get('id')
        if User.objects.filter(id=id).exists():
            return JsonResponse({'isAvailable': False}, status=200)
        return JsonResponse({'isAvailable': True}, status=200)
    
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

# 사용자 정보 반환 기능
def user_info(request):
    if request.method == 'GET':
        user_id = request.session.get('user_id')
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                user_data = {
                    'name': user.name,
                    'age': user.age
                }
                return JsonResponse(user_data, status=200)
            except User.DoesNotExist:
                return JsonResponse({'message': '사용자를 찾을 수 없습니다.'}, status=404)
        return JsonResponse({'message': '로그인되지 않았습니다.'}, status=401)
    
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