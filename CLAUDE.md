# FA Report Generator

LG에너지솔루션 현장 주간 미팅 내용을 자동으로 분석하고 Word 보고서를 생성하는 AI 시스템입니다.

## 개요

- **AI 엔진**: Claude (Anthropic API)
- **입력**: 주간 미팅 텍스트 (직접 입력 또는 파일)
- **출력**: 현장별 이슈 정리 Word(.docx) 문서
- **구조**: Site → Project → Issue 계층 자동 분류

## 빠른 시작

### 1. 환경 변수 설정

```bash
# Windows
set ANTHROPIC_API_KEY=sk-ant-...

# Linux/Mac
export ANTHROPIC_API_KEY=sk-ant-...
```

또는 프로젝트 루트에 `.env` 파일 생성:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. 패키지 설치

```bash
pip install -r backend/requirements.txt
```

### 3. 주간 보고서 생성 (Claude Code Skill)

Claude Code에서 미팅 내용을 붙여넣은 뒤:

```
/weekly-report
```

또는 CLI로 직접 실행:

```bash
# 파일에서 입력
python scripts/process_meeting.py --file meeting_notes.txt

# 제목 지정
python scripts/process_meeting.py --file meeting.txt --title "1월 3주차 현장 보고"

# 출력 경로 지정
python scripts/process_meeting.py --file meeting.txt --output outputs/report.docx
```

### 4. 웹 UI 실행

```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

웹 브라우저에서 http://localhost:5173 접속

## 디렉토리 구조

```
FA-Report-Gen/
├── backend/              # FastAPI 백엔드
│   ├── agents/           # AI 에이전트 (Analyzer, Categorizer, Summarizer)
│   ├── routers/          # API 엔드포인트
│   └── services/         # Claude API 클라이언트, 파일 파서
├── frontend/             # React + TypeScript UI
├── scripts/
│   ├── process_meeting.py   # CLI: 미팅 → Word 변환
│   └── generate_word.py     # Word 문서 생성기
├── outputs/              # 생성된 Word 파일 저장 위치
└── .claude/commands/
    └── weekly-report.md  # /weekly-report 슬래시 커맨드
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/ingest/text` | 텍스트 분석 및 저장 |
| POST | `/api/ingest/file` | 파일 업로드 분석 |
| GET | `/api/sites` | 현장 계층 구조 조회 |
| GET | `/api/report-items` | 보고서 항목 목록 |
| POST | `/api/reports/generate` | 최종 보고서 생성 + Word 파일 |
| GET | `/api/reports` | 보고서 히스토리 |

## 개발 명령어

```bash
# 백엔드 실행
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# 프론트엔드 실행
cd frontend && npm run dev

# Word 문서만 생성 테스트
python scripts/generate_word.py input.txt output.docx
```

## 입력 예시

```
ESMI 현장 주간 미팅 (2024-01-15)

현황:
- 배터리 모듈 라인 가동률 95% 유지 중
- 신규 설비 설치 완료, 시운전 진행 중

이슈:
1. 용접 불량 발생 (HIGH) - 3라인 용접기 교체 필요
2. 자재 공급 지연 (MID) - 구리선 납기 1주일 지연

다음 주 계획:
- 용접기 교체 완료 예정 (1/18)
- 대체 자재 공급업체 검토
```

## 출력 예시 (Word 문서 구조)

```
주간 현장 업무 보고
작성일: 2024년 01월 15일
─────────────────────────────

■ ESMI 현장
  ▶ 현황
    • 배터리 모듈 라인 가동률 95% 유지 중
    • 신규 설비 설치 완료, 시운전 진행 중

  ▶ 이슈
    • [HIGH] 용접 불량 발생 - 3라인 용접기 교체 필요
    • [MID] 자재 공급 지연 - 구리선 납기 1주일 지연

  ▶ 다음 주 계획
    • 용접기 교체 완료 예정 (1/18)
    • 대체 자재 공급업체 검토
```
