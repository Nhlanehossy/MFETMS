from django.contrib import admin

from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("ticket_number", "user", "match", "category", "purchase_price", "status", "purchase_date")
    list_filter = ("status", "category", "match")
    search_fields = ("ticket_number", "qr_code", "user__username")
    readonly_fields = ("ticket_number", "qr_code", "purchase_date")

# Register your models here.
