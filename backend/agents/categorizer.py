"""Categorizer Agent: 분석 결과를 DB 계층(Site→Project→Issue)에 매핑/생성."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models.schema import Site, Project, Issue


async def categorize(
    db: AsyncSession,
    analysis: dict,
    input_data_id: int,
) -> tuple[int | None, int | None, int | None]:
    """Returns (site_id, project_id, issue_id)."""

    site_id = await _get_or_create_site(db, analysis)
    project_id = await _get_or_create_project(db, analysis, site_id)
    issue_id = await _get_or_create_issue(db, analysis, project_id)

    return site_id, project_id, issue_id


async def _get_or_create_site(db: AsyncSession, analysis: dict) -> int | None:
    code = (analysis.get("site_code") or "UNKNOWN").strip().upper()
    name = analysis.get("site_name") or code

    if code == "UNKNOWN" and not name:
        return None

    result = await db.execute(select(Site).where(Site.code == code))
    site = result.scalar_one_or_none()

    if not site:
        site = Site(code=code, name=name)
        db.add(site)
        await db.flush()

    return site.id


async def _get_or_create_project(
    db: AsyncSession, analysis: dict, site_id: int | None
) -> int | None:
    project_name = analysis.get("project_name")
    if not project_name or not site_id:
        return None

    result = await db.execute(
        select(Project).where(Project.site_id == site_id, Project.name == project_name)
    )
    project = result.scalar_one_or_none()

    if not project:
        project = Project(site_id=site_id, name=project_name)
        db.add(project)
        await db.flush()

    return project.id


async def _get_or_create_issue(
    db: AsyncSession, analysis: dict, project_id: int | None
) -> int | None:
    issues = analysis.get("issues", [])
    if not issues or not project_id:
        return None

    first_issue = issues[0]
    title = first_issue.get("title", "")
    severity = first_issue.get("severity", "mid")

    if not title:
        return None

    result = await db.execute(
        select(Issue).where(Issue.project_id == project_id, Issue.title == title)
    )
    issue = result.scalar_one_or_none()

    if not issue:
        issue = Issue(project_id=project_id, title=title, severity=severity)
        db.add(issue)
        await db.flush()

    return issue.id
