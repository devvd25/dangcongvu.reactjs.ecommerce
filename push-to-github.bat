@echo off
title Day code len GitHub - Nhóm 10
color 0b
echo =========================================================
echo    DANG DAY CODE LEN GITHUB CHO DU AN ECOMMERCE
echo =========================================================
echo.
git push origin master
echo.
if %errorlevel% neq 0 (
    echo =========================================================
    echo [LOI] Khong the push code len GitHub!
    echo Neu GitHub yeu cau dang nhap, hay dang nhap bang trinh duyet
    echo hoac dung Personal Access Token (PAT) cua GitHub lam mat khau.
    echo =========================================================
) else (
    echo =========================================================
    echo [THANH CONG] Da push toan bo code len GitHub!
    echo Bay gio ban co the quay lai Jenkins va bam "Build Now".
    echo =========================================================
)
echo.
pause
