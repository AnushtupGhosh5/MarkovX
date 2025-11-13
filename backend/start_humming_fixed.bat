@echo off
echo ========================================
echo Starting Humming Server (Fixed)
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Python environment...
python --version
echo.

echo Starting server on http://localhost:8001
echo Press Ctrl+C to stop
echo.

python humming_server.py

pause
