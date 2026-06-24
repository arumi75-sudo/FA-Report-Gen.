"""Analyzer Agent: 입력 텍스트에서 Site/Project/Issue 키워드를 추출."""
import json
import re
from backend.services import ollama_client

SYSTEM_PROMPT = """당신은 LG에너지솔루션의 현장(Site), 프로젝트, 이슈를 분석하는 전문 AI입니다.
주어진 텍스트에서 다음 정보를 추출하여 반드시 JSON 형식으로만 응답하세요.
다른 설명 없이 JSON만 출력하세요.

출력 형식:
{
  "site_code": "ESMI",
  "site_name": "LG에너지솔루션 Michigan 법인",
  "project_name": "프로젝트명 (없으면 null)",
  "issues": [
    {"title": "이슈 제목", "severity": "high|mid|low"}
  ],
  "summary_hint": "전체 내용 한 줄 요약"
}

site_code는 영문 약자(예: ESMI, KSMI, CNMI)로 추출하세요. 명확하지 않으면 "UNKNOWN"으로 설정하세요."""


FALLBACK_RESULT = {
    "site_code": "UNKNOWN",
    "site_name": "미분류",
    "project_name": None,
    "issues": [],
    "summary_hint": "",
}


async def analyze(text: str, model: str) -> dict:
    prompt = f"다음 텍스트를 분석하세요:\n\n{text[:4000]}"
    try:
        response = await ollama_client.chat(model, prompt, system=SYSTEM_PROMPT)
        return _parse_json(response)
    except Exception as e:
        print(f"[Analyzer] 오류: {e}")
        return FALLBACK_RESULT


def _parse_json(text: str) -> dict:
    # JSON 블록 추출 시도
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return FALLBACK_RESULT
