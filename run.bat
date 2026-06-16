@echo off
echo ========================================================
echo    Shree Renukamba Communication Platform
echo    ElectroFix - Mobile Repair ^& Electronics Commerce
echo ========================================================
echo.

echo [1/4] Checking and installing dependencies...
if not exist "backend\node_modules\" (
    echo   node_modules not found in backend. Installing dependencies...
    cd backend && call npm install && cd ..
) else (
    echo   Backend dependencies already installed.
)

if not exist "frontend\node_modules\" (
    echo   node_modules not found in frontend. Installing dependencies...
    cd frontend && call npm install && cd ..
) else (
    echo   Frontend dependencies already installed.
)
echo.

echo [2/4] Cleaning up any old running server instances...

:: Stop any existing processes running on port 5000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo   Stopping backend process with PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

:: Stop any existing processes running on port 5173 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo   Stopping frontend process with PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

echo.

echo [3/4] Starting Backend Server (Express/Node.js)...
start "Backend API Server" cmd /k "cd backend && npm run dev"

echo.
echo [4/4] Starting Frontend Application (React/Vite)...
start "Frontend Web Server" cmd /k "cd frontend && npm run dev"

echo.
echo Launching web app in default browser...
ping -n 4 127.0.0.1 >nul
start http://localhost:5173

echo.
echo ========================================================
echo All servers are launching in separate windows!
echo   Database:     SQLite (Default) / PostgreSQL (via .env)
echo   Backend API:  http://localhost:5000
echo   Frontend App: http://localhost:5173
echo.
echo Default Accounts (seeded):
echo   Admin:     admin@electrofix.com / admin123
echo   Customer:  john@example.com / customer123
echo ========================================================
