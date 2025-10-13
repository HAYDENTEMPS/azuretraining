@echo off
echo ======================================
echo Checking ALL TypeScript errors...
echo ======================================
npx tsc --noEmit --pretty

echo.
echo ======================================
echo Checking ALL ESLint errors...
echo ======================================
npx eslint . --ext .ts,.tsx --format=compact

echo.
echo ======================================
echo Summary complete - check above for all issues
echo ======================================
pause
