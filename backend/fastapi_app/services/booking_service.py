from datetime import timedelta
from uuid import UUID

import pytz
from asgiref.sync import sync_to_async
from django.db import IntegrityError
from fastapi import HTTPException, status

from fastapi_app.schemas.booking import BookingCreate, RescheduleRequest


def _to_utc(dt):
    return dt.replace(tzinfo=pytz.utc) if dt.tzinfo is None else dt.astimezone(pytz.utc)


def _validate_timezone(tz_str: str):
    try:
        return pytz.timezone(tz_str)
    except pytz.UnknownTimeZoneError:
        raise HTTPException(422, f"Unknown timezone: '{tz_str}'")


def _validate_answers(answers, event_type) -> dict:
    questions = getattr(event_type, "custom_questions", None) or []
    answer_map = {a.key: a.value for a in answers}
    for q in questions:
        if isinstance(q, dict) and q.get("required"):
            if not answer_map.get(q["key"], "").strip():
                raise HTTPException(422, f"Required: '{q['label']}'")
    return answer_map


async def _resolve_event(event_type_id: UUID):
    from apps.events.models import EventType
    et = await sync_to_async(
        EventType.objects.select_related("user")
        .filter(id=event_type_id, is_active=True).first
    )()
    if not et:
        raise HTTPException(404, "Event type not found or inactive")
    return et


async def _verify_slot_free(host, eff_start, eff_end, exclude_booking_id=None):
    from apps.bookings.models import Booking
    qs = Booking.objects.filter(
        host=host, status="confirmed",
        start_utc__lt=eff_end, end_utc__gt=eff_start,
    )
    if exclude_booking_id:
        qs = qs.exclude(id=exclude_booking_id)
    if await sync_to_async(qs.exists)():
        raise HTTPException(status.HTTP_409_CONFLICT, "Slot is no longer available.")


async def create_booking(data: BookingCreate, host=None):
    from apps.bookings.models import Booking
    event_type = await _resolve_event(data.event_type_id)
    _validate_timezone(data.invitee_timezone)
    resolved_host = host or event_type.user

    start_utc = _to_utc(data.slot_start_utc)
    end_utc = start_utc + timedelta(minutes=event_type.duration_minutes)
    eff_start = start_utc - timedelta(minutes=event_type.buffer_before)
    eff_end = end_utc + timedelta(minutes=event_type.buffer_after)

    await _verify_slot_free(resolved_host, eff_start, eff_end)
    answer_map = _validate_answers(data.answers, event_type)

    try:
        return await sync_to_async(Booking.objects.create)(
            event_type=event_type, host=resolved_host,
            invitee_email=data.invitee_email, invitee_name=data.invitee_name,
            invitee_timezone=data.invitee_timezone,
            start_utc=start_utc, end_utc=end_utc,
            status="confirmed", notes=data.notes, invitee_answers=answer_map,
        )
    except IntegrityError:
        raise HTTPException(409, "This slot was just taken. Please choose another.")


async def reschedule_booking(booking_id: UUID, data: RescheduleRequest):
    from apps.bookings.models import Booking
    from django.db import transaction

    booking = await sync_to_async(
        Booking.objects.select_related("event_type", "host").filter(id=booking_id).first
    )()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking.status != "confirmed":
        raise HTTPException(400, f"Cannot reschedule a {booking.status} booking")

    _validate_timezone(data.invitee_timezone)
    event_type = booking.event_type
    host = booking.host

    new_start = _to_utc(data.slot_start_utc)
    new_end = new_start + timedelta(minutes=event_type.duration_minutes)
    eff_start = new_start - timedelta(minutes=event_type.buffer_before)
    eff_end = new_end + timedelta(minutes=event_type.buffer_after)

    await _verify_slot_free(host, eff_start, eff_end, exclude_booking_id=booking_id)

    def _atomic():
        with transaction.atomic():
            orig = Booking.objects.select_for_update().get(id=booking_id)
            if orig.status != "confirmed":
                raise HTTPException(400, "Booking modified concurrently")
            orig.status = "rescheduled"
            orig.save(update_fields=["status", "updated_at"])
            return Booking.objects.create(
                event_type=event_type, host=host,
                invitee_email=orig.invitee_email, invitee_name=orig.invitee_name,
                invitee_timezone=data.invitee_timezone,
                start_utc=new_start, end_utc=new_end,
                status="confirmed", notes=orig.notes,
                invitee_answers=orig.invitee_answers, rescheduled_from=orig,
            )

    try:
        return await sync_to_async(_atomic)()
    except IntegrityError:
        raise HTTPException(409, "Slot conflict. Choose another time.")


async def get_booking_public(booking_id: UUID):
    from apps.bookings.models import Booking
    booking = await sync_to_async(
        Booking.objects.select_related("event_type", "host")
        .filter(id=booking_id).first
    )()
    if not booking:
        raise HTTPException(404, "Booking not found")
    return booking


async def list_upcoming(host) -> list:
    from apps.bookings.models import Booking
    from django.utils import timezone
    return await sync_to_async(
        lambda: list(
            Booking.objects.filter(
                host=host, status="confirmed", start_utc__gte=timezone.now()
            ).select_related("event_type").order_by("start_utc")
        )
    )()


async def list_past(host) -> list:
    from apps.bookings.models import Booking
    from django.utils import timezone
    return await sync_to_async(
        lambda: list(
            Booking.objects.filter(host=host, start_utc__lt=timezone.now())
            .exclude(status="confirmed")
            .select_related("event_type").order_by("-start_utc")
        )
    )()


async def cancel_booking(booking_id: UUID, host, reason: str = "") -> None:
    from apps.bookings.models import Booking
    booking = await sync_to_async(
        Booking.objects.filter(id=booking_id, host=host).first
    )()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking.status != "confirmed":
        raise HTTPException(400, f"Cannot cancel a {booking.status} booking")
    booking.status = "cancelled"
    booking.cancel_reason = reason
    await sync_to_async(booking.save)(update_fields=["status", "cancel_reason", "updated_at"])