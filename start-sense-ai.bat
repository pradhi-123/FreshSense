@echo off
echo ============================================================
echo  Sense AI - Starting All Services
echo ============================================================

echo [1/2] Starting Flask Backend (port 5005)...
start "SenseAI-Backend" /min cmd /c "d:\First_project_clgclub\scratch\FreshSense-AI\venv\Scripts\python.exe d:\First_project_clgclub\sense_backend\server.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Vite Frontend (port 5173)...
start "SenseAI-Frontend" cmd /c "cd /d d:\First_project_clgclub\client && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo ============================================================
echo  Sense AI is LIVE!
echo ============================================================
echo.
echo  Desktop:  http://localhost:5173
echo  Mobile:   http://10.10.192.189:5173
echo  Backend:  http://localhost:5005/api/health
echo.
echo  Open the Desktop URL in your browser.
echo  Open the Mobile URL on your phone (same Wi-Fi).
echo ============================================================
pause
