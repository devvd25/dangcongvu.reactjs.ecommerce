@echo off
title Deploy nhanh len AWS EC2 - Nhom 10
color 0b
cd /d "%~dp0"

rem ==========================================================
rem  Deploy thang len EC2, khong qua Jenkins:
rem  build image tren may nay -> push Docker Hub -> SSH vao EC2
rem  pull image moi va chay lai docker compose.
rem  Luu y: bo qua buoc test cua Jenkins, nho commit + push code
rem  len GitHub sau khi deploy de lan build Jenkins sau khong ghi de.
rem ==========================================================

set DOCKER_USER=devvd25
set FRONTEND_IMAGE=%DOCKER_USER%/ecommerce-frontend:latest
set BACKEND_IMAGE=%DOCKER_USER%/ecommerce-backend:latest
set AWS_VPS_IP=13.212.197.81
set DOMAIN_NAME=13.212.197.81.sslip.io
set KEY_FILE=DevOps-ST23D-2026-KEY.pem

echo =========================================================
echo    DEPLOY NHANH LEN AWS EC2 (KHONG QUA JENKINS)
echo =========================================================
echo.

if not exist "%KEY_FILE%" (
    echo [LOI] Khong tim thay file key %KEY_FILE% trong thu muc du an!
    goto :fail
)

docker info >nul 2>&1
if errorlevel 1 (
    echo [LOI] Docker chua chay. Hay mo Docker Desktop roi chay lai file nay.
    goto :fail
)

git status --porcelain --untracked-files=no | findstr . >nul && (
    echo [CANH BAO] Co thay doi chua commit - code nay se len web nhung chua co tren GitHub.
    echo.
)

echo Chon phan can deploy:
echo   1. Frontend  - chi sua giao dien ReactJS
echo   2. Backend   - chi sua API Node.js
echo   3. Ca hai
echo.
choice /c 123 /n /m "Nhap lua chon [1/2/3]: "
set CHOICE_NUM=%errorlevel%
echo.

if %CHOICE_NUM%==2 goto :backend

echo [1] Dang build image Frontend...
docker build -t %FRONTEND_IMAGE% .
if errorlevel 1 goto :build_fail
call :push %FRONTEND_IMAGE%
if errorlevel 1 goto :fail
if %CHOICE_NUM%==1 goto :deploy

:backend
echo [2] Dang build image Backend...
docker build -t %BACKEND_IMAGE% ./backend
if errorlevel 1 goto :build_fail
call :push %BACKEND_IMAGE%
if errorlevel 1 goto :fail

:deploy
echo.
echo [3] Dang SSH vao EC2 %AWS_VPS_IP% de cap nhat container...
ssh -o StrictHostKeyChecking=accept-new -i "%KEY_FILE%" ubuntu@%AWS_VPS_IP% "cd ~/ecommerce-deploy && sudo docker compose pull && sudo docker compose up -d && (sudo docker image prune -f || true) && sudo docker ps --format 'table {{.Names}}\t{{.Status}}'"
if errorlevel 1 (
    echo [LOI] Khong cap nhat duoc container tren EC2!
    goto :fail
)

echo.
echo [4] Kiem tra web dang chay...
timeout /t 10 /nobreak >nul
curl -k -s -o nul -w "API health: HTTP %%{http_code}" "https://%DOMAIN_NAME%/api/health"
echo.
echo.
echo =========================================================
echo [THANH CONG] Da deploy xong: https://%DOMAIN_NAME%
echo Nho Ctrl+F5 tren trinh duyet de xoa cache.
echo =========================================================
echo.
pause
exit /b 0

rem ---- Push image, neu chua dang nhap Docker Hub thi dang nhap roi thu lai
:push
echo     -^> Dang push %1 len Docker Hub...
docker push %1
if not errorlevel 1 exit /b 0
echo     Push that bai, co the do chua dang nhap Docker Hub. Dang nhap tai khoan %DOCKER_USER%:
docker login -u %DOCKER_USER%
if errorlevel 1 exit /b 1
docker push %1
exit /b %errorlevel%

:build_fail
echo [LOI] Build image that bai! Xem log loi o tren.

:fail
echo.
echo =========================================================
echo [THAT BAI] Deploy khong thanh cong, web van giu ban cu.
echo =========================================================
echo.
pause
exit /b 1
