from django.conf import settings
from django.db import models


class VerificationLog(models.Model):
    class Status(models.TextChoices):
        VALID = "VALID", "Valid"
        USED = "USED", "Used"
        INVALID = "INVALID", "Invalid"
        EXPIRED = "EXPIRED", "Expired"

    ticket = models.ForeignKey("tickets.Ticket", on_delete=models.SET_NULL, null=True, blank=True, related_name="verification_logs")
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    gate_number = models.PositiveIntegerField()
    verification_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices)

    def __str__(self):
        return f"{self.ticket_id or 'Unknown'} - {self.status}"

# Create your models here.
