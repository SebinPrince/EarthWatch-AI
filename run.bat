@echo off
echo ========================================================
echo        Starting EarthWatch AI Platform
echo ========================================================
echo.

echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000...
start "EarthWatch Backend" cmd /k "cd /d %~dp0backend && .\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Vite Frontend on http://localhost:5173...
start "EarthWatch Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo EarthWatch AI is booting up!
echo Open your browser at: http://localhost:5173/
echo API Documentation:   http://127.0.0.1:8000/docs
echo ========================================================
