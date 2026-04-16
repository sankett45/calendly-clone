import uuid
from django.db import models
from django.db.models import Q
from django.conf import settings
from apps.events.models import EventType


class Booking(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        RESCHEDULED = "rescheduled", "Rescheduled"
        NO_SHOW = "no_show", "No Show"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.ForeignKey(EventType, on_delete=models.PROTECT, related_name="bookings")
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
                             related_name="hosted_bookings")
    invitee_email = models.EmailField()
    invitee_name = models.CharField(max_length=200)
    invitee_timezone = models.CharField(max_length=64)
    start_utc = models.DateTimeField()
    end_utc = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    cancel_reason = models.TextField(blank=True)
    meeting_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    invitee_answers = models.JSONField(default=dict, blank=True)
    rescheduled_from = models.ForeignKey("self", on_delete=models.SET_NULL,
                                         null=True, blank=True, related_name="rescheduled_to")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bookings"
        constraints = [
            models.UniqueConstraint(
                fields=["host", "start_utc"],
                condition=Q(status="confirmed"),
                name="uq_host_start_confirmed",
            ),
        ]
        indexes = [
            models.Index(fields=["host", "start_utc", "end_utc"]),
            models.Index(fields=["invitee_email"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.host.username} | {self.invitee_name} @ {self.start_utc:%Y-%m-%d %H:%M} UTC [{self.status}]"