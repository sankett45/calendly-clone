from typing import List
from uuid import UUID

from fastapi import APIRouter, status
from asgiref.sync import sync_to_async   # ✅ ADD THIS

from fastapi_app.schemas.event import EventTypeCreate, EventTypeUpdate, EventTypeOut
from fastapi_app.services import event_service as svc

router = APIRouter(tags=["events"])


# ── Event CRUD ───────────────────────────────────────────────────────────────

@router.get("/events", response_model=List[EventTypeOut])
async def list_events():
    from apps.users.models import User
    user = await sync_to_async(User.objects.first)()   # ✅ FIX
    return await svc.list_events(user)


@router.post("/events", response_model=EventTypeOut, status_code=status.HTTP_201_CREATED)
async def create_event(payload: EventTypeCreate):
    from apps.users.models import User
    user = await sync_to_async(User.objects.first)()   # ✅ FIX
    return await svc.create_event(payload, user)


@router.get("/events/{event_id}", response_model=EventTypeOut)
async def get_event(event_id: UUID):
    from apps.users.models import User
    user = await sync_to_async(User.objects.first)()   # ✅ FIX
    return await svc.get_event(event_id, user)


@router.patch("/events/{event_id}", response_model=EventTypeOut)
async def update_event(event_id: UUID, payload: EventTypeUpdate):
    from apps.users.models import User
    user = await sync_to_async(User.objects.first)()   # ✅ FIX
    return await svc.update_event(event_id, payload, user)


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: UUID):
    from apps.users.models import User
    user = await sync_to_async(User.objects.first)()   # ✅ FIX
    await svc.delete_event(event_id, user)


# ── Public event lookup ───────────────────────────────────────────────────────

@router.get("/u/{username}/{event_slug}/event", tags=["public"])
async def get_public_event(username: str, event_slug: str):
    return await svc.get_event_by_slug(username, event_slug)