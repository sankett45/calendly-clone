from datetime import datetime, timedelta, date
from typing import List

import pytz
from asgiref.sync import sync_to_async

from fastapi_app.schemas.booking import SlotOut


async def generate_slots(host, event_type, target_date: date, viewer_tz: str) -> List[SlotOut]:
    weekday = target_date.weekday()
    windows = await _load_availability(host, event_type, weekday)
    if not windows:
        return []

    existing = await _load_bookings_for_day(host, target_date)
    now_utc = datetime.now(pytz.utc)
    duration = timedelta(minutes=event_type.duration_minutes)
    buf_before = timedelta(minutes=event_type.buffer_before)
    buf_after = timedelta(minutes=event_type.buffer_after)

    try:
        viewer_timezone = pytz.timezone(viewer_tz)
    except pytz.UnknownTimeZoneError:
        viewer_timezone = pytz.utc

    slots: List[SlotOut] = []

    for win in windows:
        try:
            win_tz = pytz.timezone(win.timezone)
        except pytz.UnknownTimeZoneError:
            win_tz = pytz.utc

        win_start_utc = win_tz.localize(
            datetime.combine(target_date, win.start_time)
        ).astimezone(pytz.utc)
        win_end_utc = win_tz.localize(
            datetime.combine(target_date, win.end_time)
        ).astimezone(pytz.utc)

        cursor = win_start_utc
        while cursor + duration <= win_end_utc:
            slot_start = cursor
            slot_end = cursor + duration

            if slot_start <= now_utc:
                cursor += duration
                continue

            eff_start = slot_start - buf_before
            eff_end = slot_end + buf_after

            if not _has_overlap(eff_start, eff_end, existing):
                slots.append(SlotOut(
                    start_utc=slot_start,
                    end_utc=slot_end,
                    start_local=slot_start.astimezone(viewer_timezone),
                    end_local=slot_end.astimezone(viewer_timezone),
                ))
            cursor += duration

    return slots


def _has_overlap(eff_start, eff_end, bookings):
    for b in bookings:
        if b.start_utc < eff_end and b.end_utc > eff_start:
            return True
    return False


async def _load_availability(host, event_type, weekday: int) -> list:
    from apps.events.models import Availability

    def _query():
        specific = list(Availability.objects.filter(
            user=host, event_type=event_type, day_of_week=weekday,
        ))
        return specific or list(Availability.objects.filter(
            user=host, event_type__isnull=True, day_of_week=weekday,
        ))

    return await sync_to_async(_query)()


async def _load_bookings_for_day(host, target_date: date) -> list:
    from apps.bookings.models import Booking
    day_start = datetime.combine(target_date, datetime.min.time()).replace(
        tzinfo=pytz.utc) - timedelta(days=1)
    day_end = day_start + timedelta(days=3)
    return await sync_to_async(
        lambda: list(Booking.objects.filter(
            host=host, status="confirmed",
            start_utc__lt=day_end, end_utc__gt=day_start,
        ))
    )()