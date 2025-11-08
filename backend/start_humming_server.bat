@echo off
echo Starting Humming-to-Music Server...
echo.

REM Check if virtual environment exists
if not exist "..\venv\Scripts\activate.bat" (
    if not exist "..\venv310\Scripts\activate.bat" (
        echo Virtual environment not found!
        echo Please run: python -m venv venv
        pause
        exit /b 1
    )
)

REM Activate virtual environment
if exist "..\venv\Scripts\activate.bat" (
    call ..\venv\Scripts\activate.bat
) else (
    call ..\venv310\Scripts\activate.bat
)

REM Check if dependencies are installed
python -c "import crepe" 2>nul
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r ..\requirements.txt
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
)

REM Create outputs directory
if not exist "outputs" mkdir outputs

echo.
echo Server starting on http://localhost:8001
echo Press Ctrl+C to stop
echo.

python humming_server.py

pause
