# /weekly-report

주간 미팅 내용을 분석하여 현장별 Word 보고서를 자동 생성합니다.

## 사용법

1. 미팅 내용을 이 메시지에 붙여넣기 하거나, 파일 경로를 지정하세요.
2. `/weekly-report` 를 실행하세요.

## 동작

아래 명령을 실행합니다:

```bash
python scripts/process_meeting.py
```

미팅 내용이 `$ARGUMENTS` 에 포함된 경우 임시 파일로 저장 후 처리합니다.

---

다음 단계를 실행하세요:

1. 사용자가 제공한 미팅 텍스트를 임시 파일에 저장하세요.
2. `python scripts/process_meeting.py --file <임시파일>` 을 실행하세요.
3. 생성된 Word 파일 경로를 사용자에게 알려주세요.

만약 미팅 텍스트 없이 실행된 경우, 사용자에게 미팅 내용을 요청하세요.

## 예시

사용자가 다음과 같이 입력한 경우:

```
/weekly-report
ESMI 현장 주간 미팅 (2024-01-15)
- 배터리 모듈 라인 가동률 95%
- 용접 불량 이슈 발생 (HIGH)
```

실행할 명령:

```bash
python scripts/process_meeting.py --file /tmp/meeting_input.txt --title "주간 현장 업무 보고"
```
