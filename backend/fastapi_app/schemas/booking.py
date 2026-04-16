from __future__ import annotations
from uuid import UUID
from datetime import datetime, time, date
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr


class AvailabilityCreate(BaseModel):
    event_type_id: Optional[UUID] = None
    day_of_week: int = Field(..., ge=0, le=6)
    start_time: time
    end_time: time
    timezone: str = "UTC"

    def model_post_init(self, __context):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")


class AvailabilityOut(BaseModel):
    id: UUID
    event_type_id: Optional[UUID]
    day_of_week: int
    start_time: time
    end_time: time
    timezone: str
    model_config = {"from_attributes": True}


class SlotOut(BaseModel):
    start_utc: datetime
    end_utc: datetime
    start_local: datetime
    end_local: datetime


class QuestionDefinition(BaseModel):
    key: str
    label: str
    type: str = "text"
    required: bool = False
    placeholder: str = ""


class InviteeAnswer(BaseModel):
    key: str
    value: str


class BookingCreate(BaseModel):
    event_type_id: UUID
    slot_start_utc: datetime
    invitee_email: EmailStr
    invitee_name: str = Field(..., min_length=1, max_length=200)
    invitee_timezone: str
    notes: str = ""
    answers: List[InviteeAnswer] = []


class BookingOut(BaseModel):
    id: UUID
    event_type_id: UUID
    host_id: UUID
    invitee_email: str
    invitee_name: str
    invitee_timezone: str
    start_utc: datetime
    end_utc: datetime
    status: str
    meeting_url: str
    notes: str
    created_at: datetime
    rescheduled_from_id: Optional[UUID] = None
    invitee_answers: dict = {}
    model_config = {"from_attributes": True}


class BookingCancelRequest(BaseModel):
    reason: str = ""


class RescheduleRequest(BaseModel):
    slot_start_utc: datetime
    invitee_timezone: str