@echo off
echo ==============================================
echo   STREAM AURA - ANTIGRAVITY LAYOUT RESETTER
echo ==============================================
echo.
echo Closing Antigravity IDE...
taskkill /f /im "Antigravity IDE.exe"
timeout /t 2 /nobreak > nul

echo Clearing layout cache...
if exist "C:\Users\alimo\AppData\Roaming\Antigravity\Local Storage\leveldb" (
    rd /s /q "C:\Users\alimo\AppData\Roaming\Antigravity\Local Storage\leveldb"
    echo Layout cache cleared successfully!
) else (
    echo Layout cache folder not found or already cleared.
)

echo.
echo Starting Antigravity IDE with default layout...
start "" "C:\Users\alimo\AppData\Local\Programs\Antigravity\Antigravity IDE.exe"
echo Done! You can close this window.
exit
