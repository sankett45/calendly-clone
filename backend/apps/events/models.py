import uuid
from django.db import models
from django.utils.text import slugify
from django.conf import settings


class EventType(models.Model):
    class LocationType(models.TextChoices):
        GOOGLE_MEET = "google_meet", "Google Meet"
        ZOOM = "zoom", "Zoom"
        PHONE = "phone", "Phone call"
        IN_PERSON = "in_person", "In person"
        CUSTOM = "custom", "Custom"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                             related_name="event_types")
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=100)
    description = models.TextField(blank=True)
    duration_minutes = models.PositiveSmallIntegerField(default=30)
    color = models.CharField(max_length=7, default="#006BFF")
    location_type = models.CharField(max_length=20, choices=LocationType.choices,
                                     default=LocationType.GOOGLE_MEET)
    buffer_before = models.PositiveSmallIntegerField(default=0)
    buffer_after = models.PositiveSmallIntegerField(default=0)
    custom_questions = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "event_types"
        unique_together = [("user", "slug")]
        indexes = [models.Index(fields=["user", "is_active"])]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username}/{self.slug}"


class Availability(models.Model):
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0; TUESDAY = 1; WEDNESDAY = 2
        THURSDAY = 3; FRIDAY = 4; SATURDAY = 5; SUNDAY = 6

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                             related_name="availability")
    event_type = models.ForeignKey(EventType, on_delete=models.CASCADE,
                                   related_name="availability", null=True, blank=True)
    day_of_week = models.SmallIntegerField(choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    timezone = models.CharField(max_length=64, default="UTC")

    class Meta:
        db_table = "availability"
        indexes = [models.Index(fields=["user", "event_type", "day_of_week"])]

    def __str__(self):
        return f"{self.user.username} {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"