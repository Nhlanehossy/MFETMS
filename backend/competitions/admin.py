from django.contrib import admin

from .models import Competition


@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ("name", "organizer", "season", "competition_type", "start_date", "end_date", "status")
    list_filter = ("competition_type", "season", "status")
    search_fields = ("name", "organizer__name")

# Register your models here.
