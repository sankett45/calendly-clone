from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["host", "invitee_name", "invitee_email", "start_utc", "status", "created_at"]
    list_filter = ["status", "host"]
    search_fields = ["invitee_email", "invitee_name", "host__username"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-start_utc"]
    date_hierarchy = "start_utc"