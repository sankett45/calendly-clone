from typing import List
from uuid import UUID

from fastapi import APIRouter, status
from asgiref.sync import sync_to_async   # ✅ ADD THIS

from fastapi_app.schemas.booking import (
    BookingCreate,
    BookingOut,
    BookingCancelRequest,
    RescheduleRequest,
)
from fastapi_app.services import booking_service as svc

router = APIRouter(prefix="/bookings", tags=["bookings"])


# ── Public endpoints ──────────────────────────────────────────────────────────

@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(payload: BookingCreate):
    return await svc.create_booking(payload)


@router.get("/{booking_id}/public", response_model=BookingOut)
async def get_booking_public(booking_id: UUID):
    return await svc.get_booking_public(booking_id)


@router.patch("/{booking_id}/reschedule", response_model=BookingOut)
async def reschedule_booking(booking_id: UUID, payload: RescheduleRequest):
    return await svc.reschedule_booking(booking_id, payload)


# ── Host endpoints (demo user) ─────────────────────────────────

@router.get("/upcoming", response_model=List[BookingOut])
async def upcoming_meetings():
    from apps.users.models import User
    user = await sync_to_async(User.objects.first)()   # ✅ FIX
    return await svc.list_upcoming(user)


@router.get("/past", response_model=List[BookingOut])
async def past_meetings():
    from apps.users.models import User
    user = await sync_to_async(User.objects.first)()   # ✅ FIX
    return await svc.list_past(user)


@router.post("/{booking_id}/cancel", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
    booking_id: UUID,
    payload: BookingCancelRequest,
):
    from apps.users.models import User
    user = await sync_to_async(User.objects.first)()   # ✅ FIX
    await svc.cancel_booking(booking_id, user, reason=payload.reason)