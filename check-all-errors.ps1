# PowerShell script to check all errors
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Checking ALL TypeScript errors..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
npx tsc --noEmit --pretty

Write-Host ""
Write-Host "======================================" -ForegroundColor Yellow
Write-Host "Checking ALL ESLint errors..." -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
npx eslint . --ext .ts,.tsx --format=compact

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Summary complete - check above for all issues" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Read-Host "Press Enter to exit"
