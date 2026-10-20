@echo off
title PRINTFORGE - Django Backend (127.0.0.1:8000)
cd /d "%~dp0"
echo Starting Django Backend Server...
venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
pause
