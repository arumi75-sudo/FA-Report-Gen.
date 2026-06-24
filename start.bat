@echo off
chcp 65001 >nul
title FA Report Generator - LG에너지솔루션

echo ╔══════════════════════════════════════════════╗
echo ║    FA Report Generator - LG에너지솔루션     ║
echo ╚══════════════════════════════════════════════╝
echo.

:: 스크립트 위치로 이동
cd /d "%~dp0"

:: ─────────────────────────────────────
:: [1/3] Ollama 확인 및 시작
:: ─────────────────────────────────────
echo [1/3] Ollama 상태 확인...

where ollama >nul 2>&1
if errorlevel 1 (
    echo   ⚠  Ollama가 설치되어 있지 않습니다.
    echo      https://ollama.com/download 에서 설치 후 다시 실행하세요.
    pause
    exit /b 1
)

curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo   → Ollama 서버 시작 중...
    start /min "" ollama serve
    timeout /t 3 /nobreak >nul
    echo   ✓ Ollama 서버 시작됨
) else (
    echo   ✓ Ollama 이미 실행 중
)

:: ─────────────────────────────────────
:: [2/3] Backend 시작
:: ─────────────────────────────────────
echo.
echo [2/3] Backend 시작 (FastAPI, port 8000)...

where uvicorn >nul 2>&1
if errorlevel 1 (
    echo   ⚠  uvicorn을 찾을 수 없습니다. 패키지를 설치합니다...
    pip install -r backend\requirements.txt
)

start "FA-Backend" /min cmd /c "uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload > logs\backend.log 2>&1"
timeout /t 3 /nobreak >nul

curl -s http://localhost:8000/api/health >nul 2>&1
if errorlevel 1 (
    echo   ✗ Backend 시작 실패. logs\backend.log 를 확인하세요.
    pause
    exit /b 1
) else (
    echo   ✓ Backend 시작됨 (http://localhost:8000)
)

:: ─────────────────────────────────────
:: [3/3] Frontend 시작
:: ─────────────────────────────────────
echo.
echo [3/3] Frontend 시작 (React, port 5173)...

if not exist "frontend\node_modules" (
    echo   → node_modules 없음. npm install 실행 중...
    cd frontend
    npm install
    cd ..
)

start "FA-Frontend" /min cmd /c "cd frontend && npm run dev > ..\logs\frontend.log 2>&1"
timeout /t 4 /nobreak >nul
echo   ✓ Frontend 시작됨 (http://localhost:5173)

:: ─────────────────────────────────────
:: 완료
:: ─────────────────────────────────────
echo.
echo ══════════════════════════════════════════════
echo   ✅ 시스템 시작 완료
echo.
echo   웹 UI:    http://localhost:5173
echo   API:      http://localhost:8000
echo   API 문서: http://localhost:8000/docs
echo.
echo   종료하려면 이 창을 닫거나 Ctrl+C 를 누르세요.
echo ══════════════════════════════════════════════
echo.

:: 브라우저 자동 열기
timeout /t 2 /nobreak >nul
start http://localhost:5173

:: 창이 닫히지 않도록 대기
pause
