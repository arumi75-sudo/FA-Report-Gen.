#!/bin/bash
# 모델 다운로드 스크립트
# 사용법: bash scripts/pull_models.sh [model_name]

MODEL=${1:-"exaone3.5:7.8b"}

echo "=== Ollama 모델 다운로드 ==="
echo "모델: $MODEL"
echo ""

# Ollama 서버 실행 확인
if ! curl -s http://localhost:11434/api/tags &>/dev/null; then
    echo "Ollama 서버를 시작합니다..."
    ollama serve &
    sleep 3
fi

echo "다운로드 시작: $MODEL"
echo "용량에 따라 수 분에서 수십 분이 소요될 수 있습니다."
echo ""

ollama pull "$MODEL"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ $MODEL 다운로드 완료"
    echo ""
    echo "설치된 모델 목록:"
    ollama list
else
    echo "✗ 다운로드 실패"
    echo ""
    echo "권장 모델 목록:"
    echo "  exaone3.5:7.8b    - LG AI 한국어 특화 (권장, ~5GB)"
    echo "  exaone3.5:2.4b    - 경량 버전 (~1.5GB)"
    echo "  qwen2.5:7b        - 다국어 지원 (~5GB)"
    echo "  gemma3:4b         - 경량 고성능 (~3GB)"
    exit 1
fi
