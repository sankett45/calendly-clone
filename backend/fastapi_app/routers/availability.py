from typing import List
from uuid import UUID
from datetime import date

from fastapi import APIRouter, Query
from asgiref.sync import sync_to_async

from fastapi_app.schemas.booking import AvailabilityCreate, AvailabilityOut, SlotOut
from fastapi_app.services import availability_service as avail_svc
from fastapi_app.services import slot_service as slot_svc

router = APIRouter(tags=["availability"])


@router.get("/availability", response_model=List[AvailabilityOut])
async def list_availability(
    event_type_id: UUID = Query(None),
):
    from apps.users.models import User
    user = await sync_to_async(User.objects.first)()
    return await avail_svc.list_availability(user, event_type_id)


@router.post("/availability", response_model=AvailabilityOut, status_code=201)
async def set_availability(payload: AvailabilityCreate):
    from apps.users.models import User
    user = await sync_to_async(User.objects.first)()
    return await avail_svc.set_availability(payload, user)


@router.delete("/availability/{availability_id}", status_code=204)
async def delete_availability(availability_id: UUID):
    from apps.users.models import User
    user = await sync_to_async(User.objects.first)()
    await avail_svc.delete_availability(availability_id, user)


@router.post("/availability/bulk", status_code=200)
async def save_bulk_availability(payload: List[AvailabilityCreate]):
    from apps.users.models import User
    from asgiref.sync import sync_to_async

    user = await sync_to_async(User.objects.first)()

    results = []

    for item in payload:
        if item.start_time and item.end_time:
            result = await avail_svc.set_availability(item, user)
            results.append(result)
        else:
            await avail_svc.delete_by_day(user, item.day_of_week)

    return {"saved": len(results)}

@router.get(
    "/u/{username}/{event_slug}/slots",
    response_model=List[SlotOut],
)
async def get_available_slots(
    username: str,
    event_slug: str,
    date: date = Query(...),
    timezone: str = Query("UTC"),
):
    from apps.users.models import User
    from apps.events.models import EventType
    from fastapi import HTTPException

    # get user
    host = await sync_to_async(User.objects.filter(username=username).first)()
    if not host:
        raise HTTPException(status_code=404, detail="User not found")

    # get event
    event_type = await sync_to_async(
        EventType.objects.filter(user=host, slug=event_slug, is_active=True).first
    )()
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")

    # generate slots
    return await slot_svc.generate_slots(
        host=host,
        event_type=event_type,
        target_date=date,
        viewer_tz=timezone,
    )