from django.db import models


class Competition(models.Model):
    class Type(models.TextChoices):
        LEAGUE = "LEAGUE", "League"
        CUP = "CUP", "Cup"
        WOMENS_LEAGUE = "WOMENS_LEAGUE", "Women's League"
        DIVISION = "DIVISION", "Division"

    name = models.CharField(max_length=180)
    organizer = models.ForeignKey("organizations.Organization", on_delete=models.PROTECT, related_name="competitions")
    season = models.CharField(max_length=20)
    competition_type = models.CharField(max_length=32, choices=Type.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, default="ACTIVE")

    class Meta:
        unique_together = ("name", "season")

    def __str__(self):
        return f"{self.name} {self.season}"

# Create your models here.
