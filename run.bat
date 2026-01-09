@echo off
REM Seedling - Generational Wealth Time Machine
REM Windows startup script

echo.
echo Starting Seedling - Generational Wealth Time Machine...
echo.

REM Check if we're in the right directory
if not exist "requirements.txt" (
    echo Error: Please run this script from the seedling directory
    exit /b 1
)

REM Install dependencies if needed
echo Checking dependencies...
pip install -r requirements.txt --quiet 2>nul

REM Start the backend server
echo Starting backend server on http://localhost:8000
start "Seedling Backend" /b cmd /c "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

REM Give the backend a moment to start
timeout /t 2 /nobreak >nul

REM Start a simple frontend server
echo Starting frontend on http://localhost:3000
start "Seedling Frontend" /b cmd /c "cd frontend && python -m http.server 3000"

echo.
echo =====================================================
echo   Seedling is running!
echo =====================================================
echo.
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo.
echo   Press any key to open the frontend in your browser...
pause >nul

start http://localhost:3000

echo.
echo   Press any key to stop all servers and exit...
pause >nul

REM Kill the servers
taskkill /f /fi "WINDOWTITLE eq Seedling Backend*" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq Seedling Frontend*" >nul 2>&1

echo Servers stopped. Goodbye!
