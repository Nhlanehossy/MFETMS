from django.contrib import admin

from .models import VerificationLog


@admin.register(VerificationLog)
class VerificationLogAdmin(admin.ModelAdmin):
    list_display = ("ticket", "verified_by", "gate_number", "status", "verification_time")
    list_filter = ("status", "gate_number")
    search_fields = ("ticket__ticket_number", "verified_by__username")

# Register your models here.
