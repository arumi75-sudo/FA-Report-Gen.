#!/bin/bash
# FA Report Generator 통합 시작 스크립트

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "╔══════════════════════════════════════════════╗"
echo "║    FA Report Generator - LG에너지솔루션     ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# 환경 변수 확인
if [ -z "$ANTHROPIC_API_KEY" ] && [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "  ⚠  ANTHROPIC_API_KEY가 설정되어 있지 않습니다."
    echo "     .env 파일 또는 환경 변수로 설정하세요."
    exit 1
fi
echo "  ✓ ANTHROPIC_API_KEY 확인됨"

# 1. Backend 시작
echo ""
echo "[1/2] Backend 시작 (FastAPI, port 8000)..."
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &>/tmp/fa-backend.log &
BACKEND_PID=$!
sleep 2

if curl -s http://localhost:8000/api/health &>/dev/null; then
    echo "  ✓ Backend 시작됨 (PID: $BACKEND_PID)"
else
    echo "  ✗ Backend 시작 실패. 로그: /tmp/fa-backend.log"
    exit 1
fi

# 2. Frontend 시작
echo ""
echo "[2/2] Frontend 시작 (React, port 5173)..."

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
echo "  웹 UI:    http://localhost:5173"
echo "  API:      http://localhost:8000"
echo "  API 문서: http://localhost:8000/docs"
echo ""
echo "  종료: Ctrl+C"
echo "══════════════════════════════════════════════"

cleanup() {
    echo ""
    echo "시스템 종료 중..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "완료"
}
trap cleanup EXIT INT TERM

wait
