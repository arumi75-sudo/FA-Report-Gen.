"""Summarizer Agent: 입력 데이터를 카테고리별 report_items로 요약."""
import json
import re
from sqlalchemy.ext.asyncio import AsyncSession
from backend.services import ollama_client
from backend.models.schema import ReportItem

SYSTEM_PROMPT = """당신은 LG에너지솔루션 현장 보고서 작성 전문 AI입니다.
주어진 텍스트를 분석하여 다음 4가지 카테고리로 요약하세요.
반드시 JSON 배열 형식으로만 응답하세요.

출력 형식:
[
  {"category": "현황", "content": "현재 상태 요약"},
  {"category": "이슈", "content": "발견된 문제점 요약"},
  {"category": "조치사항", "content": "취해진 또는 취해야 할 조치 요약"},
  {"category": "계획", "content": "향후 계획 요약"}
]

내용이 없는 카테고리는 "해당 내용 없음"으로 작성하세요."""


async def summarize(db: AsyncSession, input_data_id: int, text: str, model: str) -> list[ReportItem]:
    prompt = f"다음 내용을 요약하세요:\n\n{text[:4000]}"
    try:
        response = await ollama_client.chat(model, prompt, system=SYSTEM_PROMPT)
        items_data = _parse_json(response)
    except Exception as e:
        print(f"[Summarizer] 오류: {e}")
        items_data = _fallback_items(text)

    items = []
    for item_data in items_data:
        item = ReportItem(
            input_data_id=input_data_id,
            category=item_data.get("category", "기타"),
            content=item_data.get("content", ""),
            is_included=True,
        )
        db.add(item)
        items.append(item)

    await db.flush()
    return items


def _parse_json(text: str) -> list[dict]:
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return _fallback_items(text)


def _fallback_items(text: str) -> list[dict]:
    preview = text[:200] + "..." if len(text) > 200 else text
    return [
        {"category": "현황", "content": preview},
        {"category": "이슈", "content": "해당 내용 없음"},
        {"category": "조치사항", "content": "해당 내용 없음"},
        {"category": "계획", "content": "해당 내용 없음"},
    ]


async def generate_final_report(included_items: list[ReportItem], model: str, title: str) -> str:
    if not included_items:
        return "선택된 항목이 없습니다."

    items_text = "\n".join(
        f"[{item.category}]\n{item.content}" for item in included_items
    )
    system = "당신은 전문적인 보고서 작성 AI입니다. 주어진 항목들을 종합하여 체계적인 보고서를 작성하세요."
    prompt = f"제목: {title}\n\n다음 항목들을 종합하여 보고서를 작성하세요:\n\n{items_text}"

    try:
        return await ollama_client.chat(model, prompt, system=system)
    except Exception as e:
        return f"보고서 생성 오류: {e}\n\n--- 원본 항목 ---\n{items_text}"
