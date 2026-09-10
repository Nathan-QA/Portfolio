@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3 preview.py
  goto end
)
where node >nul 2>nul
if %errorlevel% equ 0 (
  node scripts/open-preview.mjs
  goto end
)
where python >nul 2>nul
if %errorlevel% equ 0 (
  python preview.py
  goto end
)
echo Python 3 ou Node.js 22 est necessaire pour lancer le serveur local.
echo Voir README.md pour les instructions.
:end
pause
