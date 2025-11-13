@echo off
echo ========================================
echo FluidSynth Installation Script
echo ========================================
echo.
echo This script will install FluidSynth using Chocolatey
echo You need to run this as Administrator!
echo.
echo Right-click this file and select "Run as administrator"
echo.
pause

REM Check if running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click the file and select "Run as administrator"
    pause
    exit /b 1
)

echo Running as Administrator - Good!
echo.

REM Check if Chocolatey is installed
where choco >nul 2>&1
if %errorLevel% neq 0 (
    echo Chocolatey is not installed. Installing Chocolatey first...
    echo.
    
    REM Install Chocolatey
    @"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
    
    if %errorLevel% neq 0 (
        echo Failed to install Chocolatey
        pause
        exit /b 1
    )
    
    echo Chocolatey installed successfully!
    echo.
)

echo Installing FluidSynth...
echo.

choco install fluidsynth -y

if %errorLevel% neq 0 (
    echo.
    echo FluidSynth installation failed!
    echo.
    echo Alternative: Download manually from:
    echo https://github.com/FluidSynth/fluidsynth/releases
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo FluidSynth installed successfully!
echo ========================================
echo.
echo Now installing Python package...
echo.

REM Activate virtual environment if it exists
if exist "venv310\Scripts\activate.bat" (
    call venv310\Scripts\activate.bat
) else if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

pip install pyfluidsynth

if %errorLevel% neq 0 (
    echo.
    echo Warning: pyfluidsynth installation failed
    echo You may need to install it manually: pip install pyfluidsynth
    echo.
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo You can now run the humming server:
echo   python backend\humming_server.py
echo.
pause
