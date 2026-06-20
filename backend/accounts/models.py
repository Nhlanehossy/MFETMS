from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    class Role(models.TextChoices):
        SUPER_ADMIN = "SUPER_ADMIN", "Super Administrator"
        SULOM_ADMIN = "SULOM_ADMIN", "SULOM Administrator"
        CLUB_ADMIN = "CLUB_ADMIN", "Club Administrator"
        TICKET_OFFICER = "TICKET_OFFICER", "Ticket Officer"
        SUPPORTER = "SUPPORTER", "Supporter"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mfetms_profile")
    role = models.CharField(max_length=32, choices=Role.choices)
    organization = models.ForeignKey("organizations.Organization", on_delete=models.SET_NULL, null=True, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    status = models.CharField(max_length=20, default="ACTIVE")

    def __str__(self):
        return f"{self.user.get_username()} - {self.role}"

# Create your models here.
