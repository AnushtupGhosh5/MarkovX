@echo off
echo ========================================
echo   Humming-to-Music App Startup
echo ========================================
echo.

REM Start the humming backend server
echo [1/2] Starting humming backend server on port 8001...
start "Humming Backend" cmd /k "venv310\Scripts\activate && python backend/humming_server.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start the Next.js frontend
echo [2/2] Starting Next.js frontend...
start "Next.js Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:8001
echo Frontend: http://localhost:3001
echo.
echo Click the 6th icon (music note) in the sidebar
echo to access the Humming-to-Music feature!
echo.
echo Press any key to close this window...
pause >nul
