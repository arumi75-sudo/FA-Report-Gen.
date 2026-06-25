"""Claude API 클라이언트 서비스."""
import os
import anthropic

MODEL = "claude-sonnet-4-6"

_client: anthropic.AsyncAnthropic | None = None


def get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        _client = anthropic.AsyncAnthropic(api_key=api_key)
    return _client


async def chat(prompt: str, system: str = "") -> str:
    client = get_client()
    kwargs: dict = {
        "model": MODEL,
        "max_tokens": 4096,
        "messages": [{"role": "user", "content": prompt}],
    }
    if system:
        kwargs["system"] = system

    response = await client.messages.create(**kwargs)
    return response.content[0].text


def is_configured() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY"))
