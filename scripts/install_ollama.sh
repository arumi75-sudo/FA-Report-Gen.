#!/bin/bash
# Ollama 설치 스크립트

echo "=== Ollama 설치 ==="

if command -v ollama &>/dev/null; then
    echo "✓ Ollama가 이미 설치되어 있습니다: $(ollama --version 2>/dev/null || echo 'version unknown')"
    exit 0
fi

echo "Ollama를 설치합니다..."
curl -fsSL https://ollama.com/install.sh | sh

if command -v ollama &>/dev/null; then
    echo "✓ Ollama 설치 완료"
else
    echo "✗ Ollama 설치 실패. https://ollama.com/download 에서 수동으로 설치하세요."
    exit 1
fi
