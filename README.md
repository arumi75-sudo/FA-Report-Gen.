# FA Report Generator

LG에너지솔루션 현장 보고서 AI 생성 시스템 — **완전 로컬 실행** (Ollama 기반)

## 주요 기능

- **다중 에이전트 파이프라인**: 분석 → 분류 → 요약 에이전트 순차 처리
- **계층 데이터 관리**: 현장(Site) → 프로젝트 → 이슈 자동 분류 및 트리 뷰
- **체크리스트 보고서**: 항목별 포함/제외 선택 후 AI 보고서 생성
- **파일 업로드**: PDF / Word(.docx) / Excel(.xlsx) 지원
- **로컬 AI**: Ollama를 통한 EXAONE, Qwen2.5, Gemma3 등 지원
- **전체 이력 보존**: 제외한 데이터도 DB에 영구 저장

## 빠른 시작

```bash
# 1. Ollama 설치
bash scripts/install_ollama.sh

# 2. EXAONE 모델 다운로드 (~5GB)
bash scripts/pull_models.sh exaone3.5:7.8b

# 3. Python 패키지 설치
pip install -r backend/requirements.txt

# 4. Frontend 패키지 설치
cd frontend && npm install && cd ..

# 5. 시스템 시작
bash start.sh
```

브라우저에서 **http://localhost:5173** 접속

## 사용 방법

1. 좌측 **데이터 입력** 패널에 텍스트 붙여넣기 또는 파일 업로드
2. 에이전트가 자동으로 현장/프로젝트/이슈 분류 → 좌측 트리에 반영
3. 중앙 **체크리스트**에서 보고서에 포함할 항목 선택/해제
4. 우측 **보고서 생성** 버튼으로 최종 보고서 출력 및 다운로드

## 기술 스택

| 구성 | 기술 |
|------|------|
| Backend | FastAPI + SQLite (SQLAlchemy) |
| Frontend | React 18 + TypeScript + Tailwind CSS |
| AI | Ollama (EXAONE / Qwen2.5 / Gemma3) |
| 파일 파싱 | PyMuPDF / python-docx / openpyxl |
