@echo off
echo ========================================
echo Setting up Humming Feature (Simple Mode)
echo ========================================
echo.
echo This will install dependencies WITHOUT FluidSynth
echo You'll be able to extract melodies but not generate audio
echo.

cd /d "%~dp0"

echo Installing Python dependencies...
pip install -r requirements_humming.txt

echo.
echo Testing installation...
python test_humming_simple.py

echo.
echo ========================================
echo Setup complete!
echo.
echo To start the humming server:
echo   python humming_server.py
echo.
echo The server will run on http://localhost:8001
echo ========================================
pause
