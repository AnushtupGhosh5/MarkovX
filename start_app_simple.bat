@echo off
echo ========================================
echo Starting MusePilot (Without FluidSynth)
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv310\Scripts\activate.bat" (
    if not exist "venv\Scripts\activate.bat" (
        echo ERROR: Virtual environment not found!
        echo Please create one first:
        echo   python -m venv venv310
        echo   venv310\Scripts\activate
        echo   pip install -r requirements.txt
        pause
        exit /b 1
    )
)

echo Installing/updating Python dependencies...
echo.

REM Activate virtual environment
if exist "venv310\Scripts\activate.bat" (
    call venv310\Scripts\activate.bat
) else (
    call venv\Scripts\activate.bat
)

REM Install basic dependencies (without FluidSynth)
pip install --quiet fastapi uvicorn python-multipart crepe librosa pretty_midi soundfile numpy scipy

echo.
echo ========================================
echo Starting Humming Server...
echo ========================================
echo.
echo Server will run on: http://localhost:8001
echo.
echo Note: Audio synthesis (WAV output) is disabled
echo      You'll still get MIDI files and piano roll display
echo.
echo To enable WAV output, install FluidSynth:
echo   See FLUIDSYNTH_INSTALL_GUIDE.md
echo.
echo ========================================
echo.

cd backend
python humming_server.py

pause
