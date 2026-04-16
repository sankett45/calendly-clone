from uuid import UUID
from asgiref.sync import sync_to_async
from fastapi import HTTPException, status
from django.utils.text import slugify

from fastapi_app.schemas.event import EventTypeCreate, EventTypeUpdate


def _get_event_or_404(event_id: UUID, user):
    from apps.events.models import EventType
    obj = EventType.objects.filter(id=event_id, user=user).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Event type not found")
    return obj


async def list_events(user) -> list:
    from apps.events.models import EventType
    return await sync_to_async(
        lambda: list(EventType.objects.filter(user=user).order_by("-created_at"))
    )()


async def create_event(data: EventTypeCreate, user):
    from apps.events.models import EventType
    slug = data.slug or slugify(data.title)
    exists = await sync_to_async(EventType.objects.filter(user=user, slug=slug).exists)()
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail=f"Slug '{slug}' already in use")
    return await sync_to_async(EventType.objects.create)(
        user=user, title=data.title, slug=slug,
        description=data.description, duration_minutes=data.duration_minutes,
        color=data.color, location_type=data.location_type,
        buffer_before=data.buffer_before, buffer_after=data.buffer_after,
        custom_questions=data.custom_questions,
    )


async def get_event(event_id: UUID, user):
    return await sync_to_async(_get_event_or_404)(event_id, user)


async def get_event_by_slug(username: str, slug: str):
    """
    Public lookup — called by page5.tsx booking page.
    Returns event metadata without auth.
    """
    from apps.events.models import EventType
    from apps.users.models import User

    host = await sync_to_async(User.objects.filter(username=username).first)()
    if not host:
        raise HTTPException(status_code=404, detail="User not found")

    event = await sync_to_async(
        EventType.objects.filter(user=host, slug=slug, is_active=True).first
    )()
    if not event:
        raise HTTPException(status_code=404, detail="Event type not found or inactive")
    return event


async def update_event(event_id: UUID, data: EventTypeUpdate, user):
    event = await sync_to_async(_get_event_or_404)(event_id, user)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(event, field, value)
    await sync_to_async(event.save)()
    return event


async def delete_event(event_id: UUID, user) -> None:
    event = await sync_to_async(_get_event_or_404)(event_id, user)
    await sync_to_async(event.delete)()