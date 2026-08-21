@echo off
chcp 65001 >nul
title Creador de Acceso Directo USB - VeterinariaYELLOW
color 0A

echo ===============================================================================
echo       CREADOR DE ACCESO DIRECTO EN EL ESCRITORIO PARA MEMORIA USB
echo ===============================================================================
echo.
set "USB_PATH=%~dp0Iniciar_VeterinariaYELLOW_x64.bat"
set "DESKTOP_DIR=%USERPROFILE%\Desktop"
set "SHORTCUT_VBS=%TEMP%\create_vet_shortcut.vbs"

echo Creando acceso directo a VeterinariaYELLOW en tu escritorio...
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%SHORTCUT_VBS%"
echo sLinkFile = "%DESKTOP_DIR%\VeterinariaYELLOW (USB).lnk" >> "%SHORTCUT_VBS%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%SHORTCUT_VBS%"
echo oLink.TargetPath = "%USB_PATH%" >> "%SHORTCUT_VBS%"
echo oLink.WorkingDirectory = "%~dp0" >> "%SHORTCUT_VBS%"
echo oLink.Description = "Acceso directo a VeterinariaYELLOW en la memoria USB" >> "%SHORTCUT_VBS%"
echo oLink.Save >> "%SHORTCUT_VBS%"

cscript /nologo "%SHORTCUT_VBS%"
del "%SHORTCUT_VBS%"

echo.
echo [EXITO] Acceso directo 'VeterinariaYELLOW (USB)' creado en el Escritorio.
echo Puedes conectar tu USB en cualquier momento y hacer doble clic en el acceso directo.
echo.
pause
exit
