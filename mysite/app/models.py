from django.db import models
from django.utils import timezone

class User(models.Model):
    unique_num = models.BigAutoField(primary_key=True)  # 자동 증가하는 기본 키
    id = models.CharField(max_length=255, unique=True)  # ID (varchar)
    password = models.CharField(max_length=255)  # 비밀번호 (varchar)
    name = models.CharField(max_length=255)  # 이름 (varchar)
    age = models.IntegerField()  # 나이 (int)
    address = models.CharField(max_length=255)  # 주소 (varchar)
    detailed_address = models.CharField(max_length=255, blank=True, null=True)  # 상세 주소 (nullable)
    phone_num = models.CharField(max_length=20)  # 전화번호 (varchar)
    guard_name = models.CharField(max_length=255, blank=True, null=True)  # 보호자 이름 (nullable)
    guard_phone_num = models.CharField(max_length=20, blank=True, null=True)  # 보호자 전화번호 (nullable)
    danger_degree = models.IntegerField(blank=True, null=True)  # 위험도 (nullable)
    user_posture = models.IntegerField(blank=True, null=True)  # 사용자 자세 (nullable)

    def __str__(self):
        return self.name


class UserStatus(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.IntegerField()  # 1(정상), 2(주의), 3(응급)
    updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.name} - {self.status} at {self.updated_at}"
    
class UserPosture(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    posture = models.IntegerField()  # 0(Downstair), 1(Upstair), 2(Running), 3(Sitdown), 4(StandUp), 5(Walking), 6(Fall)
    updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.name} - {self.posture} at {self.updated_at}"