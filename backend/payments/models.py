from django.db import models


class Payment(models.Model):
    class Provider(models.TextChoices):
        TNM_MPAMBA = "TNM_MPAMBA", "TNM Mpamba"
        AIRTEL_MONEY = "AIRTEL_MONEY", "Airtel Money"
        NBS_BANK = "NBS_BANK", "NBS Bank"
        FDH_BANK = "FDH_BANK", "FDH Bank"
        NBM_BANK = "NBM_BANK", "National Bank of Malawi"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SUCCESSFUL = "SUCCESSFUL", "Successful"
        FAILED = "FAILED", "Failed"
        REVERSED = "REVERSED", "Reversed"

    ticket = models.ForeignKey("tickets.Ticket", on_delete=models.PROTECT, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    provider = models.CharField(max_length=32, choices=Provider.choices)
    transaction_reference = models.CharField(max_length=80, unique=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    def __str__(self):
        return self.transaction_reference

# Create your models here.
