@echo off
echo =====================================
echo South Delhi Real Estate Server Manager
echo =====================================
echo.

:menu
echo [1] Check server status
echo [2] Start production server
echo [3] Stop all servers on port 5000
echo [4] View server logs (last 20 lines)
echo [5] Open website in browser
echo [6] Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto check_status
if "%choice%"=="2" goto start_server
if "%choice%"=="3" goto stop_server
if "%choice%"=="4" goto view_logs
if "%choice%"=="5" goto open_browser
if "%choice%"=="6" goto exit
echo Invalid choice. Please enter 1-6.
goto menu

:check_status
echo.
echo Checking server status...
echo.
netstat -ano | findstr :5000
if %errorlevel%==0 (
    echo ✅ Server is running on port 5000
    curl -s -I http://localhost:5000 | findstr "HTTP"
) else (
    echo ❌ No server found on port 5000
)
echo.
pause
goto menu

:start_server
echo.
echo Starting production server...
echo.
npm run start:prod
pause
goto menu

:stop_server
echo.
echo Stopping all servers on port 5000...
echo.
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing process %%a
    taskkill /F /PID %%a
)
echo Server stopped.
echo.
pause
goto menu

:view_logs
echo.
echo Recent server activity would be shown here...
echo (This is a placeholder - logs depend on your logging setup)
echo.
pause
goto menu

:open_browser
echo.
echo Opening website in default browser...
start http://localhost:5000
echo.
pause
goto menu

:exit
echo.
echo Goodbye!
exit 