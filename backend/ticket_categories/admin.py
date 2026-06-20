from django.contrib import admin

from .models import MatchTicketPrice, TicketCategory


@admin.register(TicketCategory)
class TicketCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)


@admin.register(MatchTicketPrice)
class MatchTicketPriceAdmin(admin.ModelAdmin):
    list_display = ("match", "ticket_category", "price", "quantity", "available_quantity")
    list_filter = ("ticket_category",)

# Register your models here.
