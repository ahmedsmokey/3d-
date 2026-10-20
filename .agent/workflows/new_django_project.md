---
description: Initialize a new Django 5.x project with Docker, PostgreSQL, and strict layout.
---

# Workflow: Start New Django Project

## 1. Environment Setup
```bash
# Verify Python version (Should be 3.11+)
python3 --version
```

## 2. Scaffolding
// turbo
```bash
mkdir -p project_name/config
cd project_name
python3 -m venv venv
source venv/bin/activate
pip install django djangorestframework psycopg2-binary
django-admin startproject config .
```

## 3. Settings Adjustment
You must immediately edit `config/settings.py` to separate concerns:
- Create `settings/base.py`, `settings/local.py`, `settings/production.py`.
- Update `BASE_DIR` logic.

## 4. Dockerization
Create `Dockerfile` and `docker-compose.yml`.
- **Service**: `web` (Django)
- **Service**: `db` (Postgres 16)
- **Service**: `redis` (Redis 7 - for cache/celery)

## 5. Verification
Run the server and check the "Rocket" page.
```bash
python manage.py runserver
```

## 6. Git Init
```bash
git init
git add .
git commit -m "feat: Initial commit with Django structure"
```
