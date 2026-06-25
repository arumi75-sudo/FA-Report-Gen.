from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from backend.database import get_db
from backend.models.schema import InputData
from backend.services.file_parser import parse_file
from backend.agents import analyzer, categorizer, summarizer

router = APIRouter(prefix="/api/ingest", tags=["ingest"])


class TextIngestRequest(BaseModel):
    content: str


class IngestResponse(BaseModel):
    input_data_id: int
    site_code: str | None
    site_name: str | None
    project_name: str | None
    report_items_count: int
    message: str


@router.post("/text", response_model=IngestResponse)
async def ingest_text(req: TextIngestRequest, db: AsyncSession = Depends(get_db)):
    return await _process_content(req.content, None, db)


@router.post("/file", response_model=IngestResponse)
async def ingest_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(400, "파일명이 없습니다.")

    content_bytes = await file.read()
    try:
        text = await parse_file(file.filename, content_bytes)
    except ValueError as e:
        raise HTTPException(400, str(e))

    return await _process_content(text, file.filename, db)


async def _process_content(
    text: str, filename: str | None, db: AsyncSession
) -> IngestResponse:
    analysis = await analyzer.analyze(text)

    input_data = InputData(raw_content=text, file_name=filename)
    db.add(input_data)
    await db.flush()

    site_id, project_id, issue_id = await categorizer.categorize(db, analysis, input_data.id)
    input_data.site_id = site_id
    input_data.project_id = project_id
    input_data.issue_id = issue_id

    items = await summarizer.summarize(db, input_data.id, text)

    await db.commit()

    return IngestResponse(
        input_data_id=input_data.id,
        site_code=analysis.get("site_code"),
        site_name=analysis.get("site_name"),
        project_name=analysis.get("project_name"),
        report_items_count=len(items),
        message=f"데이터 처리 완료. {len(items)}개 보고서 항목 생성됨.",
    )
