@echo off
cd /d "%~dp0"

echo ===================================================
echo   BAT NGROK WEBHOOK CHO JENKINS (DOMAIN CO DINH)
echo ===================================================
echo.
echo Domain co dinh: nonsciatic-revisitable-herschel.ngrok-free.dev
echo Port Jenkins: 8080
echo.

echo [1/2] Dang khoi dong duong truyen Ngrok co dinh...
start "Ngrok Jenkins Tunnel (Khong dong cua so nay)" cmd.exe /k "ngrok http --domain=nonsciatic-revisitable-herschel.ngrok-free.dev 8080"

echo [2/2] Dang copy link Webhook vao Clipboard...
timeout /t 2 /nobreak >nul

powershell -ExecutionPolicy Bypass -Command "$webhookUrl = 'https://nonsciatic-revisitable-herschel.ngrok-free.dev/github-webhook/'; Set-Clipboard -Value $webhookUrl; Write-Host ''; Write-Host '===================================================' -ForegroundColor Green; Write-Host '  [THANH CONG] DA COPY LINK CO DINH VAO CLIPBOARD!' -ForegroundColor Green; Write-Host \"  Link Webhook cua anh: $webhookUrl\" -ForegroundColor Yellow; Write-Host '===================================================' -ForegroundColor Green; Write-Host ''; Write-Host '-> Link nay se KHONG BAO GIO BI DOI nua nhe!' -ForegroundColor Cyan;"

echo.
echo ---------------------------------------------------
echo Chu y: Giu nguyen cua so Ngrok khi dang demo.
echo ---------------------------------------------------
echo.
pause
