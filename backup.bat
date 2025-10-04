@echo off
echo Creating backup...

REM Создаем папку для бэкапов с датой и временем
set BACKUP_DIR=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

mkdir "%BACKUP_DIR%"

REM Копируем клиент и сервер
xcopy /E /I /Y client "%BACKUP_DIR%\client"
xcopy /E /I /Y server "%BACKUP_DIR%\server"

echo.
echo Backup created in %BACKUP_DIR%
echo.
pause
