import os, sys
import django

sys.stdout.reconfigure(encoding='utf-8')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Role, UserProfile

def seed_accounts():
    print("Seeding roles...")
    roles_data = [
        {"name": "محرر محتوى", "code": "EDITOR", "permissions_summary": "صلاحية 3 أقسام 20"},
        {"name": "مدير المتجر", "code": "MANAGER", "permissions_summary": "صلاحية 8 أقسام 107"},
        {"name": "موظف مخزن", "code": "STOCK", "permissions_summary": "صلاحية 2 أقسام 19"},
        {"name": "مدير عام", "code": "SUPER_ADMIN", "permissions_summary": "كل الصلاحيات"},
        {"name": "دعم الزبائن", "code": "SUPPORT", "permissions_summary": "صلاحية 3 أقسام 11"},
        {"name": "رفع ونصب", "code": "UPLOADER", "permissions_summary": "صلاحية 3 أقسام 30"},
        {"name": "مالك", "code": "OWNER", "permissions_summary": "كل الصلاحيات"},
    ]

    role_objs = {}
    for r in roles_data:
        obj, created = Role.objects.get_or_create(
            code=r["code"],
            defaults={
                "name": r["name"],
                "permissions_summary": r["permissions_summary"],
                "is_system": True
            }
        )
        if not created:
            obj.name = r["name"]
            obj.permissions_summary = r["permissions_summary"]
            obj.save()
        role_objs[r["code"]] = obj
        print(f"Role: {obj.name} ({obj.code})")

    owner_role = role_objs.get("OWNER")
    admin_user = User.objects.filter(is_superuser=True).first()
    if admin_user and owner_role:
        p, _ = UserProfile.objects.get_or_create(user=admin_user)
        p.role = owner_role
        p.save()

    print("\nAccounts seeding complete!")

if __name__ == "__main__":
    seed_accounts()
