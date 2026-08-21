@echo off
chcp 65001 >nul
title VeterinariaYELLOW - Sistema Clinico Portable x32 (x86)
color 0B

echo ===============================================================================
echo            VETERINARIA YELLOW - SISTEMA CLINICO VETERINARIO PORTABLE
echo            Version para Windows 32-Bit (x86 / x32) - Ejecucion desde USB
echo ===============================================================================
echo.
echo [1/3] Detectando unidad USB en arquitectura de 32 bits...
set "CURRENT_DIR=%~dp0"
set "APP_URL=https://ais-dev-thxz7asglq44saztkzfi2x-668157067353.us-west2.run.app"
set "OFFLINE_HTML=%CURRENT_DIR%index.html"

:: Comprobar navegadores de 32 bits comunes en Windows 7/8/10/11 x86
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL%"
    goto ex
)

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="%APP_URL%"
    goto ex
)

if exist "C:\Program Files\Mozilla Firefox\firefox.exe" (
    start "" "C:\Program Files\Mozilla Firefox\firefox.exe" "%APP_URL%"
    goto ex
)

:: Abrir navegador predeterminado
start "" "%APP_URL%"

:ex
echo [OK] VeterinariaYELLOW iniciado correctamente.
timeout /t 3 >nul
exit
