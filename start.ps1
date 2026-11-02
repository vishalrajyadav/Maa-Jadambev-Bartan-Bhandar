# Simple Inventory Management App Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  StockFlow - Minimal Inventory Management App" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Backend API on http://localhost:5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; dotnet run --launch-profile http"

Write-Host "Starting Frontend App on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev -- --port 5173"

Write-Host "`nReady! Open your browser at http://localhost:5173" -ForegroundColor Green
