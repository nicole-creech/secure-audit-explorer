@echo off
echo Cleaning up existing Next.js processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq next dev*" 2>nul
taskkill /F /IM node.exe /FI "IMAGENAME eq node.exe" | findstr /C:"SUCCESS" >nul 2>&1
if %errorlevel% neq 0 (
    echo No processes to clean up.
) else (
    echo Cleaned up existing processes.
)
echo Starting development server on port 3000...
npm run dev