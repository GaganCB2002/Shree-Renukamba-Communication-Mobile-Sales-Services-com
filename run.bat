@echo off
echo ========================================================
echo    Shree Renukamba Communication Platform
echo    ElectroFix - Mobile Repair ^& Electronics Commerce
echo ========================================================

echo.
echo Prerequisites:
echo   - MongoDB must be running on localhost:27017
echo   - Or update MONGO_URI in backend\.env
echo.
echo First time setup:
echo   1. cd backend ^&^& npm run seed    (seed sample data)
echo   2. Then run this script again
echo.

echo [1/2] Starting Backend Server (Express/Node.js)...
start "Backend API Server" cmd /k "cd backend && npm run dev"

echo [2/2] Starting Frontend Application (React/Vite)...
start "Frontend Web Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Both servers are launching in separate windows!
echo   Backend API:  http://localhost:5000
echo   Frontend App: http://localhost:5173
echo.
echo Default Accounts (after running npm run seed):
echo   Admin:     admin@electrofix.com / admin123
echo   Customer:  john@example.com / customer123
echo ========================================================
