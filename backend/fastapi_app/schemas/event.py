from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class EventTypeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    slug: Optional[str] = None
    description: str = ""
    duration_minutes: int = Field(30, ge=5, le=480)
    color: str = Field("#4361ee", pattern=r"^#[0-9A-Fa-f]{6}$")
    location_type: str = "google_meet"
    buffer_before: int = Field(0, ge=0, le=120)
    buffer_after: int = Field(0, ge=0, le=120)
    custom_questions: list = Field(default_factory=list)


class EventTypeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, ge=5, le=480)
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    location_type: Optional[str] = None
    buffer_before: Optional[int] = Field(None, ge=0, le=120)
    buffer_after: Optional[int] = Field(None, ge=0, le=120)
    is_active: Optional[bool] = None
    custom_questions: Optional[list] = None


class EventTypeOut(BaseModel):
    id: UUID
    title: str
    slug: str
    description: str
    duration_minutes: int
    color: str
    location_type: str
    buffer_before: int
    buffer_after: int
    is_active: bool
    custom_questions: list
    created_at: datetime
    model_config = {"from_attributes": True}