import uuid

from django.conf import settings
from django.db import models


class Ticket(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        USED = "USED", "Used"
        EXPIRED = "EXPIRED", "Expired"
        CANCELLED = "CANCELLED", "Cancelled"
        REFUNDED = "REFUNDED", "Refunded"

    ticket_number = models.CharField(max_length=40, unique=True, default="")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="tickets")
    match = models.ForeignKey("matches.Match", on_delete=models.PROTECT, related_name="tickets")
    category = models.ForeignKey("ticket_categories.TicketCategory", on_delete=models.PROTECT, related_name="tickets")
    seat_number = models.CharField(max_length=30, blank=True)
    qr_code = models.CharField(max_length=120, unique=True, default="")
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    purchase_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = f"MFETMS-{uuid.uuid4().hex[:10].upper()}"
        if not self.qr_code:
            self.qr_code = f"QR-{uuid.uuid4().hex}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.ticket_number

# Create your models here.
