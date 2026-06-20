from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("transaction_reference", "ticket", "amount", "provider", "status", "payment_date")
    list_filter = ("provider", "status")
    search_fields = ("transaction_reference", "ticket__ticket_number")

# Register your models here.
