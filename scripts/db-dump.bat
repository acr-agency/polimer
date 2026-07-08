@echo off
REM Скрипт для создания дампа PostgreSQL (Windows)
REM Использование: scripts\db-dump.bat [имя_файла]

set DB_HOST=%DB_HOST:localhost%
set DB_PORT=%DB_PORT:5432%
set DB_NAME=%DB_NAME:polimer%
set DB_USER=%DB_USER:postgres%
set DB_PASSWORD=%DB_PASSWORD:postgres%

if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=5432
if "%DB_NAME%"=="" set DB_NAME=polimer
if "%DB_USER%"=="" set DB_USER=postgres
if "%DB_PASSWORD%"=="" set DB_PASSWORD=postgres

if "%1"=="" (
  for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
  set FILENAME=blog_dump_%datetime:~0,8%_%datetime:~8,6%.sql
) else (
  set FILENAME=%1
)

set PGPASSWORD=%DB_PASSWORD%

echo. Creating dump %DB_NAME% -^> %FILENAME% ...

pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% --no-owner --no-acl --data-only --table=blog_articles > "%FILENAME%"

echo. Done: %FILENAME%
echo. For import on VPS:
echo.   set PGPASSWORD=postgres^& psql -h localhost -U postgres -d polimer -f %FILENAME%