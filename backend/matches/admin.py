from django.contrib import admin

from .models import Match


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ("competition", "home_team", "away_team", "stadium", "match_day", "date", "kickoff_time", "status")
    list_filter = ("competition", "status", "date")
    search_fields = ("home_team__organization__name", "away_team__organization__name", "stadium__name")

# Register your models here.
