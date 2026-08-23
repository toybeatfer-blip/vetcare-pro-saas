@echo off
chcp 65001 >nul
title VeterinariaYELLOW - Sistema Clinico Portable x64
color 0E

echo ===============================================================================
echo            VETERINARIA YELLOW - SISTEMA CLINICO VETERINARIO PORTABLE
echo               Version para Windows 64-Bit (x64) - Ejecucion desde USB
echo ===============================================================================
echo.
echo [1/3] Detectando unidad USB y navegador web compatible...
set "CURRENT_DIR=%~dp0"
set "APP_URL=https://ais-dev-thxz7asglq44saztkzfi2x-668157067353.us-west2.run.app"
set "OFFLINE_HTML=%CURRENT_DIR%index.html"

:: Verificar si existe conexion a internet
ping -n 1 8.8.8.8 >nul 2>&1
if %errorlevel% equ 0 (
    echo [2/3] Conexion activa detectada. Abriendo software clinico...
    set "TARGET_URL=%APP_URL%"
) else (
    echo [2/3] Modo sin conexion. Abriendo version offline local desde la memoria USB...
    set "TARGET_URL=%OFFLINE_HTML%"
)

echo [3/3] Iniciando interfaz de VeterinariaYELLOW...
echo.
:: Intentar abrir en modo aplicacion con Microsoft Edge o Google Chrome
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="%TARGET_URL%" --window-size=1280,800
    goto final
)

if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app="%TARGET_URL%" --window-size=1280,800
    goto final
)

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="%TARGET_URL%" --window-size=1280,800
    goto final
)

:: Navegador predeterminado como fallback
start "" "%TARGET_URL%"

:final
echo.
echo ===============================================================================
echo  VeterinariaYELLOW se esta ejecutando. Puedes minimizar esta ventana.
echo ===============================================================================
timeout /t 3 >nul
exit
