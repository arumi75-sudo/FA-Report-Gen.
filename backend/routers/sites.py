from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from datetime import datetime

from backend.database import get_db
from backend.models.schema import Site, Project, Issue, InputData

router = APIRouter(prefix="/api/sites", tags=["sites"])


class IssueOut(BaseModel):
    id: int
    title: str
    severity: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    id: int
    name: str
    status: str
    created_at: datetime
    issues: list[IssueOut] = []

    class Config:
        from_attributes = True


class SiteOut(BaseModel):
    id: int
    name: str
    code: str
    description: str | None
    created_at: datetime
    projects: list[ProjectOut] = []
    input_count: int = 0

    class Config:
        from_attributes = True


@router.get("", response_model=list[SiteOut])
async def list_sites(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Site).options(
            selectinload(Site.projects).selectinload(Project.issues)
        ).order_by(Site.created_at.desc())
    )
    sites = result.scalars().all()

    out = []
    for site in sites:
        count_result = await db.execute(
            select(InputData).where(InputData.site_id == site.id)
        )
        input_count = len(count_result.scalars().all())
        site_out = SiteOut(
            id=site.id,
            name=site.name,
            code=site.code,
            description=site.description,
            created_at=site.created_at,
            projects=[
                ProjectOut(
                    id=p.id,
                    name=p.name,
                    status=p.status,
                    created_at=p.created_at,
                    issues=[
                        IssueOut(
                            id=i.id,
                            title=i.title,
                            severity=i.severity,
                            status=i.status,
                            created_at=i.created_at,
                        )
                        for i in p.issues
                    ],
                )
                for p in site.projects
            ],
            input_count=input_count,
        )
        out.append(site_out)
    return out


@router.get("/{site_id}/input-data")
async def get_site_input_data(site_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(InputData).where(InputData.site_id == site_id).order_by(InputData.created_at.desc())
    )
    items = result.scalars().all()
    return [
        {
            "id": item.id,
            "file_name": item.file_name,
            "preview": item.raw_content[:300] + "..." if len(item.raw_content) > 300 else item.raw_content,
            "created_at": item.created_at,
        }
        for item in items
    ]
