@echo off
echo ===================================================
echo Starting Student Project Hub Backend (Django)...
echo ===================================================
start "Django Backend Server" cmd /k ".\.venv\Scripts\python manage.py runserver"

echo ===================================================
echo Starting Student Project Hub Frontend (Vite)...
echo ===================================================
cd frontend
call npm run dev
pause
