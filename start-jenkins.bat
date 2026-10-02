@echo off
cd /d "%~dp0"

echo ===================================================
echo   KHOI DONG JENKINS CI/CD SERVER - NHOM 10
echo ===================================================
echo.

echo [1/3] Kiem tra Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ===================================================
    echo   [CANH BAO] DOCKER DESKTOP CHUA DUOC BAT!
    echo ===================================================
    echo 1. Anh vui long mo ung dung Docker Desktop tren may tinh.
    echo 2. Cho den khi goc duoi hien icon xanh "Engine running".
    echo 3. Sau do chay lai file start-jenkins.bat nay nhe!
    echo.
    pause
    exit /b 1
)
echo -> Docker Desktop dang hoat dong tot!

echo.
echo [2/3] Dang khoi chay Jenkins container (myjenkins)...
docker rm -f myjenkins >nul 2>&1
docker compose -f docker-compose.jenkins.yml up -d --remove-orphans

if %errorlevel% neq 0 (
    echo.
    echo [LOI] Khong the khoi dong Jenkins. Vui long kiem tra log o tren!
    echo.
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo   [THANH CONG] Jenkins da san sang hoat dong!
echo   Dia chi Dashboard: http://localhost:8080
echo   Tai khoan: devvd25
echo ===================================================
echo.
pause
