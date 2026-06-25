"""주간 미팅 노트 → Claude AI 분석 → Word 문서 생성 CLI 스크립트.

사용법:
  echo "미팅 내용" | python scripts/process_meeting.py
  python scripts/process_meeting.py --file meeting.txt
  python scripts/process_meeting.py --file meeting.txt --output outputs/report.docx
"""
import argparse
import asyncio
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

import anthropic

MODEL = "claude-sonnet-4-6"

ANALYSIS_SYSTEM = """당신은 LG에너지솔루션 현장 주간 미팅 보고서 전문 작성 AI입니다.
주어진 미팅 내용을 분석하여 반드시 아래 JSON 형식으로만 응답하세요. 다른 설명 없이 JSON만 출력하세요.

{
  "meeting_date": "YYYY-MM-DD (미팅 날짜, 모르면 오늘 날짜)",
  "sites": [
    {
      "site_code": "ESMI",
      "site_name": "현장 전체 이름",
      "status": "현재 현황 요약 (2~4문장)",
      "issues": [
        {
          "title": "이슈 제목",
          "severity": "high|mid|low",
          "status": "open|resolved",
          "description": "이슈 상세 설명",
          "action": "조치사항"
        }
      ],
      "action_items": ["완료 또는 진행 중인 조치 1", "조치 2"],
      "next_week_plan": ["다음 주 계획 1", "계획 2"]
    }
  ],
  "overall_summary": "전체 미팅 핵심 요약 (1~2문장)"
}

현장 코드(site_code)는 영문 약어(예: ESMI, KSMI, CNMI)로 추출하세요.
여러 현장이 언급되면 sites 배열에 각각 추가하세요."""

REPORT_SYSTEM = """당신은 LG에너지솔루션 주간 현황 보고서 작성 전문가입니다.
주어진 구조화된 데이터를 바탕으로 체계적인 마크다운 보고서를 작성하세요.
보고서 형식:
- 현장별로 ## 헤딩 사용
- 각 섹션(현황, 이슈, 조치사항, 계획)은 ### 헤딩 사용
- 이슈는 심각도(HIGH/MID/LOW) 표시
- 전문적이고 간결한 문체 사용
- 한국어로 작성"""


async def analyze_meeting(text: str, client: anthropic.AsyncAnthropic) -> dict:
    """Claude API로 미팅 내용 분석."""
    prompt = f"다음 주간 미팅 내용을 분석하세요:\n\n{text[:6000]}"
    response = await client.messages.create(
        model=MODEL,
        max_tokens=4096,
        system=ANALYSIS_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = response.content[0].text
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    raise ValueError(f"JSON 파싱 실패: {raw[:200]}")


async def generate_report(data: dict, client: anthropic.AsyncAnthropic) -> str:
    """구조화된 데이터로 마크다운 보고서 생성."""
    prompt = f"다음 데이터로 주간 보고서를 작성하세요:\n\n{json.dumps(data, ensure_ascii=False, indent=2)}"
    response = await client.messages.create(
        model=MODEL,
        max_tokens=4096,
        system=REPORT_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


async def process(text: str, output_path: str, title: str) -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise EnvironmentError("ANTHROPIC_API_KEY 환경 변수가 설정되어 있지 않습니다.")

    client = anthropic.AsyncAnthropic(api_key=api_key)

    print("🔍 [1/3] 미팅 내용 분석 중 (Claude AI)...")
    data = await analyze_meeting(text, client)
    sites = data.get("sites", [])
    print(f"   → {len(sites)}개 현장 감지됨: {', '.join(s['site_code'] for s in sites)}")

    print("📝 [2/3] 보고서 초안 작성 중...")
    report_md = await generate_report(data, client)

    print("📄 [3/3] Word 문서 생성 중...")
    # scripts 디렉토리에서 import
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from scripts.generate_word import generate_word_document
    generate_word_document(report_md, title, output_path)

    return output_path


def main():
    parser = argparse.ArgumentParser(description="주간 미팅 → Word 보고서 자동 생성")
    parser.add_argument("--file", "-f", help="입력 파일 경로 (없으면 stdin)")
    parser.add_argument("--output", "-o", help="출력 Word 파일 경로")
    parser.add_argument("--title", "-t", default="주간 현장 업무 보고", help="보고서 제목")
    args = parser.parse_args()

    if args.file:
        with open(args.file, encoding="utf-8") as f:
            text = f.read()
    else:
        print("미팅 내용을 입력하세요 (입력 완료: Ctrl+D / Windows: Ctrl+Z+Enter):")
        text = sys.stdin.read()

    if not text.strip():
        print("오류: 입력 내용이 없습니다.")
        sys.exit(1)

    if not args.output:
        os.makedirs("outputs", exist_ok=True)
        args.output = f"outputs/{datetime.now().strftime('%Y%m%d_%H%M%S')}_report.docx"

    output = asyncio.run(process(text, args.output, args.title))
    print(f"\n✅ 완료! 파일 저장됨: {output}")


if __name__ == "__main__":
    main()
