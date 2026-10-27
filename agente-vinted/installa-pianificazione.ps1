# Fa partire l'agente Vinted ogni giorno. Uso:  powershell -File installa-pianificazione.ps1 -Ora 20:00
# Se alle 20 il PC è spento, parte appena viene riacceso (StartWhenAvailable).
param([string]$Ora = "20:00")
$cartella = Split-Path -Parent $PSScriptRoot
$node = (Get-Command node).Source
$azione = New-ScheduledTaskAction -Execute $node -Argument "agente-vinted\sync.mjs" -WorkingDirectory $cartella
$quando = New-ScheduledTaskTrigger -Daily -At $Ora
$opzioni = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 30)
Register-ScheduledTask -TaskName "Agente Vinted" -Action $azione -Trigger $quando -Settings $opzioni -Force | Out-Null
Write-Host "Fatto: l'agente Vinted parte ogni giorno alle $Ora."
