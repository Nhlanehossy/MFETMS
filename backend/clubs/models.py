from django.db import models


class Club(models.Model):
    organization = models.OneToOneField("organizations.Organization", on_delete=models.CASCADE, related_name="club")
    short_name = models.CharField(max_length=40)
    city = models.CharField(max_length=80)
    founded_year = models.PositiveIntegerField(null=True, blank=True)
    stadium = models.ForeignKey("stadiums.Stadium", on_delete=models.SET_NULL, null=True, blank=True)
    coach = models.CharField(max_length=120, blank=True)
    logo = models.URLField(blank=True)
    status = models.CharField(max_length=20, default="ACTIVE")

    def __str__(self):
        return self.organization.name

# Create your models here.
