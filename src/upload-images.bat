@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0upload-images.ps1"
if errorlevel 1 (
  echo.
  echo حدث خطأ. راجع الرسالة بالأعلى.
)
pause
