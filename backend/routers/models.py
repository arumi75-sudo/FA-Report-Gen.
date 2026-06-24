from fastapi import APIRouter
from backend.services.ollama_client import list_models, is_ollama_running

router = APIRouter(prefix="/api/ollama", tags=["ollama"])


@router.get("/status")
async def ollama_status():
    running = await is_ollama_running()
    return {"running": running}


@router.get("/models")
async def get_models():
    models = await list_models()
    return {
        "models": [
            {"name": m["name"], "size": m.get("size", 0), "modified_at": m.get("modified_at")}
            for m in models
        ]
    }
