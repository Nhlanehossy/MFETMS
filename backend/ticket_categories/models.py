from django.db import models


class TicketCategory(models.Model):
    name = models.CharField(max_length=80, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class MatchTicketPrice(models.Model):
    match = models.ForeignKey("matches.Match", on_delete=models.CASCADE, related_name="ticket_prices")
    ticket_category = models.ForeignKey(TicketCategory, on_delete=models.PROTECT, related_name="match_prices")
    price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField()
    available_quantity = models.PositiveIntegerField()

    class Meta:
        unique_together = ("match", "ticket_category")

    def __str__(self):
        return f"{self.match} - {self.ticket_category}"

# Create your models here.
