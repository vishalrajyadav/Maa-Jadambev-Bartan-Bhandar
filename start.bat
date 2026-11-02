@echo off
title Starting Simple Inventory Management App...
echo ========================================================
echo   StockFlow - Minimal Inventory Management Application
echo ========================================================
echo.
echo 1. Starting ASP.NET Core Web API on http://localhost:5000...
start "Inventory Backend (ASP.NET Core)" cmd /k "cd /d "%~dp0backend" && dotnet run --launch-profile http"

echo 2. Starting React Vite Frontend on http://localhost:5173...
start "Inventory Frontend (React)" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --port 5173"

echo.
echo Application started!
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:5000
echo.
pause
