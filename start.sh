#!/bin/bash
# FA Report Generator 통합 시작 스크립트

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "╔══════════════════════════════════════════════╗"
echo "║    FA Report Generator - LG에너지솔루션     ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# 1. Ollama 상태 확인
echo "[1/3] Ollama 상태 확인..."
if ! command -v ollama &>/dev/null; then
    echo "  ⚠  Ollama가 설치되어 있지 않습니다."
    echo "     bash scripts/install_ollama.sh 를 먼저 실행하세요."
    exit 1
fi

if ! curl -s http://localhost:11434/api/tags &>/dev/null; then
    echo "  → Ollama 서버 시작 중..."
    ollama serve &>/dev/null &
    OLLAMA_PID=$!
    sleep 3
    echo "  ✓ Ollama 서버 시작됨 (PID: $OLLAMA_PID)"
else
    echo "  ✓ Ollama 이미 실행 중"
fi

# 2. Backend 시작
echo ""
echo "[2/3] Backend 시작 (FastAPI, port 8000)..."
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &>/tmp/fa-backend.log &
BACKEND_PID=$!
sleep 2

if curl -s http://localhost:8000/api/health &>/dev/null; then
    echo "  ✓ Backend 시작됨 (PID: $BACKEND_PID)"
else
    echo "  ✗ Backend 시작 실패. 로그: /tmp/fa-backend.log"
    exit 1
fi

# 3. Frontend 시작
echo ""
echo "[3/3] Frontend 시작 (React, port 5173)..."

# npm이 있으면 dev 서버, 없으면 빌드된 파일 서빙
if [ -d "frontend/node_modules" ]; then
    cd frontend && npm run dev &>/tmp/fa-frontend.log &
    FRONTEND_PID=$!
    cd "$SCRIPT_DIR"
    sleep 3
    echo "  ✓ Frontend 개발서버 시작됨 (PID: $FRONTEND_PID)"
else
    echo "  ⚠  frontend/node_modules 없음. npm install 필요:"
    echo "     cd frontend && npm install"
fi

echo ""
echo "══════════════════════════════════════════════"
echo "  ✅ 시스템 시작 완료"
echo ""
echo "  🌐 웹 UI:    http://localhost:5173"
echo "  📡 API:      http://localhost:8000"
echo "  📚 API 문서: http://localhost:8000/docs"
echo ""
echo "  종료: Ctrl+C"
echo "══════════════════════════════════════════════"

# 프로세스 종료 핸들러
cleanup() {
    echo ""
    echo "시스템 종료 중..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    kill $OLLAMA_PID 2>/dev/null || true
    echo "완료"
}
trap cleanup EXIT INT TERM

wait
