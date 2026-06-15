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

echo [2/3] Starting Backend Server (Express/Node.js)...
start "Backend API Server" cmd /k "cd backend && npm run dev"

echo.
echo [3/3] Starting Frontend Application (React/Vite)...
start "Frontend Web Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo All servers are launching in separate windows!
echo   Database:     PostgreSQL (Supabase)
echo   Backend API:  http://localhost:5000
echo   Frontend App: http://localhost:5173
echo.
echo Please ensure you have added your connection string in
echo backend/.env (as DATABASE_URL=your_supabase_uri)
echo
echo Default Accounts (seeded):
echo   Admin:     admin@electrofix.com / admin123
echo   Customer:  john@example.com / customer123
echo ========================================================
