@echo off
echo Starting MongoDB...
start "" "D:\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "D:\MongoDB\db" --port 27017
timeout /t 3 /nobreak > nul
echo MongoDB started!

echo.
echo Starting Backend Server...
cd /d "D:\BloodDonorFinder\server"
start "Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo Starting React Frontend...
cd /d "D:\BloodDonorFinder\client"
start "Frontend" cmd /k "npm run dev"

echo.
echo ============================================
echo  Blood Donor Finder is starting up!
echo  Backend  : http://localhost:5000
echo  Frontend : http://localhost:5173
echo ============================================
pause
