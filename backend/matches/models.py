from django.conf import settings
from django.db import models


class Match(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        ONGOING = "ONGOING", "Ongoing"
        COMPLETED = "COMPLETED", "Completed"
        POSTPONED = "POSTPONED", "Postponed"
        CANCELLED = "CANCELLED", "Cancelled"

    competition = models.ForeignKey("competitions.Competition", on_delete=models.PROTECT, related_name="matches")
    home_team = models.ForeignKey("clubs.Club", on_delete=models.PROTECT, related_name="home_matches")
    away_team = models.ForeignKey("clubs.Club", on_delete=models.PROTECT, related_name="away_matches")
    stadium = models.ForeignKey("stadiums.Stadium", on_delete=models.PROTECT, related_name="matches")
    match_day = models.PositiveIntegerField()
    date = models.DateField()
    kickoff_time = models.TimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.home_team.short_name} vs {self.away_team.short_name}"

# Create your models here.
