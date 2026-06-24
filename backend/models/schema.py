from datetime import datetime
from sqlalchemy import Integer, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.database import Base


class Site(Base):
    __tablename__ = "sites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    projects: Mapped[list["Project"]] = relationship("Project", back_populates="site", cascade="all, delete-orphan")
    input_data: Mapped[list["InputData"]] = relationship("InputData", back_populates="site")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    site_id: Mapped[int] = mapped_column(ForeignKey("sites.id"))
    name: Mapped[str] = mapped_column(String(300))
    status: Mapped[str] = mapped_column(String(20), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    site: Mapped["Site"] = relationship("Site", back_populates="projects")
    issues: Mapped[list["Issue"]] = relationship("Issue", back_populates="project", cascade="all, delete-orphan")
    input_data: Mapped[list["InputData"]] = relationship("InputData", back_populates="project")


class Issue(Base):
    __tablename__ = "issues"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    title: Mapped[str] = mapped_column(String(500))
    severity: Mapped[str] = mapped_column(String(20), default="mid")
    status: Mapped[str] = mapped_column(String(20), default="open")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    project: Mapped["Project"] = relationship("Project", back_populates="issues")
    input_data: Mapped[list["InputData"]] = relationship("InputData", back_populates="issue")


class InputData(Base):
    __tablename__ = "input_data"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    raw_content: Mapped[str] = mapped_column(Text)
    file_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    site_id: Mapped[int | None] = mapped_column(ForeignKey("sites.id"), nullable=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    issue_id: Mapped[int | None] = mapped_column(ForeignKey("issues.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    site: Mapped["Site | None"] = relationship("Site", back_populates="input_data")
    project: Mapped["Project | None"] = relationship("Project", back_populates="input_data")
    issue: Mapped["Issue | None"] = relationship("Issue", back_populates="input_data")
    report_items: Mapped[list["ReportItem"]] = relationship("ReportItem", back_populates="input_data", cascade="all, delete-orphan")


class ReportItem(Base):
    __tablename__ = "report_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    input_data_id: Mapped[int] = mapped_column(ForeignKey("input_data.id"))
    category: Mapped[str] = mapped_column(String(100))
    content: Mapped[str] = mapped_column(Text)
    is_included: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    input_data: Mapped["InputData"] = relationship("InputData", back_populates="report_items")


class Report(Base):
    __tablename__ = "reports"
    model_config = {"protected_namespaces": ()}  # type: ignore

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(500))
    final_content: Mapped[str] = mapped_column(Text)
    model_used: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
