@echo off
chcp 65001 >nul
title FA Report Generator - LG에너지솔루션

cd /d "%~dp0"

echo.
echo  ====================================================
echo    FA Report Generator - LG에너지솔루션
echo  ====================================================
echo.

if not exist "logs" mkdir logs

:: 환경 변수 확인
if "%ANTHROPIC_API_KEY%"=="" (
    if exist ".env" (
        for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
            if /i "%%A"=="ANTHROPIC_API_KEY" set ANTHROPIC_API_KEY=%%B
        )
    )
)

if "%ANTHROPIC_API_KEY%"=="" (
    echo   [오류] ANTHROPIC_API_KEY가 설정되어 있지 않습니다.
    echo          .env 파일 또는 시스템 환경 변수로 설정하세요.
    goto :error
)
echo   [OK] ANTHROPIC_API_KEY 확인됨

:: ─────────────────────────────────────
:: [1/2] Backend 시작
:: ─────────────────────────────────────
echo.
echo [1/2] Backend 시작 (FastAPI, port 8000)...

python -m uvicorn --version >nul 2>&1
if errorlevel 1 (
    echo   -^> 패키지 설치 중...
    pip install -r backend\requirements.txt
    if errorlevel 1 (
        echo   [오류] pip install 실패.
        goto :error
    )
)

start "FA-Backend" cmd /k "cd /d %~dp0 && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"
echo   -^> Backend 시작 중...
timeout /t 4 /nobreak >nul

curl -s http://localhost:8000/api/health >nul 2>&1
if errorlevel 1 (
    echo   [오류] Backend 시작 실패.
    goto :error
)
echo   [OK] Backend 시작됨 (http://localhost:8000)

:: ─────────────────────────────────────
:: [2/2] Frontend 시작
:: ─────────────────────────────────────
echo.
echo [2/2] Frontend 시작 (React, port 5173)...

if not exist "frontend\node_modules" (
    echo   -^> node_modules 없음. npm install 실행 중...
    cd frontend
    npm install
    if errorlevel 1 (
        echo   [오류] npm install 실패.
        cd ..
        goto :error
    )
    cd ..
)

start "FA-Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 4 /nobreak >nul
echo   [OK] Frontend 시작됨 (http://localhost:5173)

echo.
echo  ====================================================
echo    [완료] 시스템 시작 완료
echo.
echo    웹 UI:    http://localhost:5173
echo    API:      http://localhost:8000
echo    API 문서: http://localhost:8000/docs
echo.
echo    종료: Backend / Frontend 창을 닫으세요
echo  ====================================================
echo.

timeout /t 2 /nobreak >nul
start http://localhost:5173

echo 이 창은 닫아도 됩니다.
pause
goto :eof

:error
echo.
echo  ====================================================
echo    [실패] 위 오류를 확인하고 다시 시도하세요.
echo  ====================================================
pause
