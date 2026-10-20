---
description: Resume work on an existing Django project. Checks environment, dependencies, and loads Agent Rules.
---

# Workflow: Load Existing Django Project

## 1. Load Rules of Engagement
**CRITICAL**: You must re-read the core rules to ensure you are in "Premium/Expert" mode.
- `view_file .agent/rules/CORE_RULES.md`
- `view_file .agent/rules/PREMIUM_DESIGN.md`

## 2. Environment Activation
Check for virtual environment text file or directory.
```bash
# Check if venv exists
ls -d venv .venv env .env_dir 2>/dev/null
# If exists, activate (adjust name as needed)
source venv/bin/activate
```

## 3. Dependency Check
Ensure all packages are up to date.
```bash
# Check python version
python --version
# Install dependencies
pip install -r requirements.txt
```

## 4. Database & Migrations
Ensure the database is reachable and schema is current.
```bash
# Check if docker is needed (if docker-compose.yml exists)
docker compose ps
# Run migrations
python manage.py migrate
```

## 5. Server Health Check
Run the server to verify everything boots up.
```bash
python manage.py runserver
```

## 6. Context Refresh
Run a quick listing to remember the project structure.
```bash
ls -R | grep ":$" | head -n 20
```
