@echo off
echo ========================================================
echo    Shree Renukamba Communication Platform
echo    ElectroFix - Mobile Repair ^& Electronics Commerce
echo ========================================================
echo.

echo [1/4] Cleaning up any old running server instances...

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

:: Check if MongoDB is running on port 27017
netstat -ano | findstr :27017 >nul
if %errorlevel% neq 0 (
    echo [2/4] Starting MongoDB Database Server...
    
    :: Ensure the data directory exists
    if not exist "data" (
        mkdir "data"
    )
    
    start "MongoDB Database Server" cmd /k "mongodb\mongodb-win32-x86_64-windows-7.0.37\bin\mongod.exe --dbpath data"
    echo Waiting 5 seconds for MongoDB to initialize...
    timeout /t 5 >nul
) else (
    echo [2/4] MongoDB is already running on port 27017.
)

echo.
echo [3/4] Starting Backend Server (Express/Node.js)...
start "Backend API Server" cmd /k "cd backend && npm run dev"

echo.
echo [4/4] Starting Frontend Application (React/Vite)...
start "Frontend Web Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo All servers are launching in separate windows!
echo   MongoDB Database: localhost:27017
echo   Backend API:      http://localhost:5000
echo   Frontend App:     http://localhost:5173
echo.
echo Default Accounts (seeded):
echo   Admin:     admin@electrofix.com / admin123
echo   Customer:  john@example.com / customer123
echo ========================================================
