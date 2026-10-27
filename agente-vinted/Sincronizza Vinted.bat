@echo off
rem Fa partire l'agente Vinted a mano (doppio clic). Il rapporto resta in agente-vinted\log.
cd /d "%~dp0.."
node agente-vinted\sync.mjs %*
echo.
pause
