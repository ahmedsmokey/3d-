from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Role(models.Model):
    name = models.CharField(max_length=100, verbose_name="اسم الدور")
    code = models.CharField(max_length=50, unique=True, verbose_name="الاسم البرمجي")
    description = models.TextField(blank=True, verbose_name="الوصف")
    permissions_summary = models.CharField(max_length=255, default="كل الصلاحيات", verbose_name="الصلاحيات")
    permissions = models.ManyToManyField('auth.Permission', blank=True, verbose_name="الصلاحيات المحددة")
    is_system = models.BooleanField(default=True, verbose_name="أساسي")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")

    class Meta:
        verbose_name = "دور وصلاحيات"
        verbose_name_plural = "الأدوار والصلاحيات"
        ordering = ['id']

    def __str__(self):
        return self.name

    @property
    def employee_count(self):
        return self.profiles.filter(user__is_staff=True).count()


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', verbose_name="المستخدم")
    phone = models.CharField(max_length=35, blank=True, default='-', verbose_name="Phone")
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='profiles', verbose_name="الدور")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الانضمام")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="آخر تحديث")

    class Meta:
        verbose_name = "ملف المستخدم"
        verbose_name_plural = "ملفات المستخدمين"

    def __str__(self):
        name = self.user.get_full_name() or self.user.first_name or self.user.username
        return f"{name} - {self.phone}"


@receiver(post_save, sender=User)
def create_or_save_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)


class Employee(User):
    class Meta:
        proxy = True
        verbose_name = "موظف"
        verbose_name_plural = "الموظفين"


class CustomerAccount(User):
    class Meta:
        proxy = True
        verbose_name = "حساب"
        verbose_name_plural = "الحسابات والزبائن"
