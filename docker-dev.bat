@echo off
REM Docker Development Script for South Delhi Real Estate (Windows)

setlocal enabledelayedexpansion

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop for Windows
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed or not in PATH
    echo Please install Docker Desktop for Windows
    exit /b 1
)

REM Check if environment file exists
if not exist ".env.docker.local" (
    echo [INFO] Creating .env.docker.local from template...
    copy .env.docker .env.docker.local >nul
    echo [WARNING] Please edit .env.docker.local with your configuration
)

REM Main command handling
if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="dev" goto dev
if "%1"=="prod" goto prod
if "%1"=="prod-nginx" goto prod_nginx
if "%1"=="build" goto build
if "%1"=="stop" goto stop
if "%1"=="clean" goto clean
if "%1"=="logs" goto logs
if "%1"=="status" goto status
if "%1"=="db-shell" goto db_shell
if "%1"=="app-shell" goto app_shell
goto help

:dev
echo [INFO] Starting development environment...
docker-compose -f docker-compose.yml -f docker-compose.override.yml --env-file .env.docker.local up --build
goto end

:prod
echo [INFO] Starting production environment...
docker-compose --env-file .env.docker.local up -d
echo [SUCCESS] Production environment started
echo [INFO] Application available at: http://localhost:7822
goto end

:prod_nginx
echo [INFO] Starting production environment with Nginx...
docker-compose --env-file .env.docker.local --profile production up -d
echo [SUCCESS] Production environment with Nginx started
echo [INFO] Application available at: http://localhost:80
goto end

:build
echo [INFO] Building Docker images...
docker-compose build --no-cache
echo [SUCCESS] Docker images built successfully
goto end

:stop
echo [INFO] Stopping all services...
docker-compose down
echo [SUCCESS] All services stopped
goto end

:clean
echo [WARNING] This will remove all containers, images, and volumes!
set /p confirm="Are you sure? (y/N): "
if /i "!confirm!"=="y" (
    echo [INFO] Cleaning up Docker resources...
    docker-compose down -v --rmi all
    docker system prune -f
    echo [SUCCESS] Cleanup completed
) else (
    echo [INFO] Cleanup cancelled
)
goto end

:logs
echo [INFO] Showing logs...
docker-compose logs -f
goto end

:status
echo [INFO] Docker container status:
docker-compose ps
echo.
echo [INFO] Docker images:
docker images | findstr sdr
echo.
echo [INFO] Docker volumes:
docker volume ls | findstr sdr
goto end

:db_shell
echo [INFO] Connecting to database shell...
docker-compose exec mysql mysql -u root -prootpassword123 southdelhirealestate
goto end

:app_shell
echo [INFO] Connecting to application shell...
docker-compose exec app bash
goto end

:help
echo South Delhi Real Estate - Docker Development Script (Windows)
echo.
echo Usage: %0 ^<command^>
echo.
echo Commands:
echo   dev          Start development environment with hot reload
echo   prod         Start production environment
echo   prod-nginx   Start production environment with Nginx proxy
echo   build        Build Docker images
echo   stop         Stop all services
echo   clean        Remove all containers, images, and volumes
echo   logs         Show logs from all services
echo   status       Show status of containers, images, and volumes
echo   db-shell     Connect to database shell
echo   app-shell    Connect to application shell
echo   help         Show this help message
echo.
echo Examples:
echo   %0 dev        # Start development environment
echo   %0 prod       # Start production environment
echo   %0 logs       # View real-time logs
echo   %0 clean      # Clean up everything
goto end

:end
pause 