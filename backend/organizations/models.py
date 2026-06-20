from django.db import models


class Organization(models.Model):
    class Type(models.TextChoices):
        FAM = "FAM", "Football Association of Malawi"
        SULOM = "SULOM", "Super League of Malawi"
        REGIONAL_ASSOCIATION = "REGIONAL_ASSOCIATION", "Regional Association"
        CLUB = "CLUB", "Club"

    name = models.CharField(max_length=180, unique=True)
    short_name = models.CharField(max_length=40)
    organization_type = models.CharField(max_length=32, choices=Type.choices)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    address = models.CharField(max_length=255, blank=True)
    logo = models.URLField(blank=True)
    website = models.URLField(blank=True)
    status = models.CharField(max_length=20, default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.short_name or self.name

# Create your models here.
