from uuid import UUID
from asgiref.sync import sync_to_async
from fastapi import HTTPException

from fastapi_app.schemas.booking import AvailabilityCreate


async def list_availability(host, event_type_id: UUID = None) -> list:
    from apps.events.models import Availability

    def query():
        qs = Availability.objects.filter(user=host)
        if event_type_id:
            qs = qs.filter(event_type_id=event_type_id)
        return list(qs.order_by("day_of_week", "start_time"))

    return await sync_to_async(query)()


async def set_availability(data: AvailabilityCreate, host):
    from apps.events.models import Availability, EventType

    event_type = None
    if data.event_type_id:
        event_type = await sync_to_async(
            EventType.objects.filter(id=data.event_type_id, user=host).first
        )()
        if not event_type:
            raise HTTPException(status_code=404, detail="Event type not found")

    # Upsert: delete existing for same (user, event_type, day_of_week)
    await sync_to_async(
        Availability.objects.filter(
            user=host,
            event_type=event_type,
            day_of_week=data.day_of_week,
        ).delete
    )()

    return await sync_to_async(Availability.objects.create)(
        user=host,
        event_type=event_type,
        day_of_week=data.day_of_week,
        start_time=data.start_time,
        end_time=data.end_time,
        timezone=data.timezone,
    )


async def delete_availability(availability_id: UUID, host) -> None:
    from apps.events.models import Availability

    obj = await sync_to_async(
        Availability.objects.filter(id=availability_id, user=host).first
    )()

    if not obj:
        raise HTTPException(status_code=404, detail="Availability window not found")

    await sync_to_async(obj.delete)()


# ✅ NEW FUNCTION (OUTSIDE)
async def delete_by_day(host, day_of_week: int):
    from apps.events.models import Availability

    await sync_to_async(
        Availability.objects.filter(
            user=host,
            day_of_week=day_of_week,
        ).delete
    )()