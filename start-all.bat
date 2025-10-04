@echo off
echo Starting server and client...
echo.

REM Запускаем сервер в новом окне
start "Server" cmd /k "cd server && npm run dev"

REM Ждем 2 секунды, чтобы сервер успел запуститься
timeout /t 2 /nobreak >nul

REM Запускаем клиент в новом окне
start "Client" cmd /k "cd client && npm run dev"

echo.
echo Server and client are starting in separate windows...
echo Press any key to exit this window.
pause >nul
