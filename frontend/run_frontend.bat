@echo off
title PRINTFORGE - React Frontend (127.0.0.1:5173)
cd /d "%~dp0"
echo Starting React Vite Frontend Server...
call npm.cmd run dev
pause
