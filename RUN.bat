@echo off
cd /d "%~dp0"

:: 1. إنهاء أي سيرفرات سابقة عالقة
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

:: 2. تشغيل الباك إند والفرونت إند في الخلفية
start /min "Django Backend" cmd /c "cd /d "%~dp0backend" && venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"
start /min "React Frontend" cmd /c "cd /d "%~dp0frontend" && npm.cmd run dev"

:: 3. مهلة قصيرة للتأكد من إقلاع السيرفر
timeout /t 2 /nobreak >nul

:: 4. فتح الموقع مباشرة في متصفح Google Chrome
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://127.0.0.1:5173"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "http://127.0.0.1:5173"
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "http://127.0.0.1:5173"
) else (
    start chrome "http://127.0.0.1:5173" 2>nul || start http://127.0.0.1:5173
)

exit
