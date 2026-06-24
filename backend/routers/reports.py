from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime

from backend.database import get_db
from backend.models.schema import ReportItem, Report, InputData
from backend.agents.summarizer import generate_final_report

router = APIRouter(prefix="/api", tags=["reports"])


class ReportItemOut(BaseModel):
    id: int
    input_data_id: int
    category: str
    content: str
    is_included: bool
    created_at: datetime
    file_name: str | None = None
    site_code: str | None = None

    class Config:
        from_attributes = True


class ToggleRequest(BaseModel):
    is_included: bool


class GenerateRequest(BaseModel):
    title: str
    model: str = "exaone3.5:7.8b"
    site_id: int | None = None


class ReportOut(BaseModel):
    id: int
    title: str
    final_content: str
    model_used: str | None
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/report-items", response_model=list[ReportItemOut])
async def list_report_items(
    site_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(ReportItem).order_by(ReportItem.created_at.desc())
    result = await db.execute(query)
    items = result.scalars().all()

    out = []
    for item in items:
        input_data = await db.get(InputData, item.input_data_id)
        if site_id and (not input_data or input_data.site_id != site_id):
            continue
        out.append(
            ReportItemOut(
                id=item.id,
                input_data_id=item.input_data_id,
                category=item.category,
                content=item.content,
                is_included=item.is_included,
                created_at=item.created_at,
                file_name=input_data.file_name if input_data else None,
            )
        )
    return out


@router.patch("/report-items/{item_id}", response_model=ReportItemOut)
async def toggle_report_item(
    item_id: int, req: ToggleRequest, db: AsyncSession = Depends(get_db)
):
    item = await db.get(ReportItem, item_id)
    if not item:
        raise HTTPException(404, "항목을 찾을 수 없습니다.")
    item.is_included = req.is_included
    await db.commit()
    await db.refresh(item)
    input_data = await db.get(InputData, item.input_data_id)
    return ReportItemOut(
        id=item.id,
        input_data_id=item.input_data_id,
        category=item.category,
        content=item.content,
        is_included=item.is_included,
        created_at=item.created_at,
        file_name=input_data.file_name if input_data else None,
    )


@router.post("/reports/generate", response_model=ReportOut)
async def generate_report(req: GenerateRequest, db: AsyncSession = Depends(get_db)):
    query = select(ReportItem).where(ReportItem.is_included == True)
    if req.site_id:
        input_ids_result = await db.execute(
            select(InputData.id).where(InputData.site_id == req.site_id)
        )
        input_ids = [r[0] for r in input_ids_result.all()]
        query = query.where(ReportItem.input_data_id.in_(input_ids))

    result = await db.execute(query)
    included = result.scalars().all()

    if not included:
        raise HTTPException(400, "포함된 보고서 항목이 없습니다.")

    content = await generate_final_report(included, req.model, req.title)
    report = Report(title=req.title, final_content=content, model_used=req.model)
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("/reports", response_model=list[ReportOut])
async def list_reports(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).order_by(Report.created_at.desc()))
    return result.scalars().all()


@router.get("/reports/{report_id}", response_model=ReportOut)
async def get_report(report_id: int, db: AsyncSession = Depends(get_db)):
    report = await db.get(Report, report_id)
    if not report:
        raise HTTPException(404, "보고서를 찾을 수 없습니다.")
    return report
