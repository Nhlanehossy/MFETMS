from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from decimal import Decimal
from django.utils import timezone

from accounts.models import UserProfile
from matches.models import Match
from mfetms.api import json_response, list_view, request_data, require_methods, require_roles
from revenue_distribution.services import calculate_match_distribution
from tickets.models import Ticket
from tickets.services import release_ticket_inventory

from .models import Payment


def payments(request):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN, UserProfile.Role.CLUB_ADMIN, UserProfile.Role.SUPPORTER])
    if error:
        return error
    queryset = Payment.objects.select_related("ticket", "ticket__user", "ticket__match__home_team__organization", "ticket__match__away_team__organization").order_by("-payment_date")
    profile = getattr(request.user, "mfetms_profile", None)
    if profile and profile.role == UserProfile.Role.SUPPORTER:
        queryset = queryset.filter(ticket__user=request.user)
    elif profile and profile.role == UserProfile.Role.CLUB_ADMIN and profile.organization:
        queryset = queryset.filter(ticket__match__home_team__organization=profile.organization) | queryset.filter(ticket__match__away_team__organization=profile.organization)
    return list_view(queryset)


@csrf_exempt
@transaction.atomic
def record_payment(request):
    error = require_methods(request, ["POST"])
    if error:
        return error

    role_error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN, UserProfile.Role.CLUB_ADMIN, UserProfile.Role.SUPPORTER])
    if role_error:
        return role_error

    data = request_data(request)
    ticket = Ticket.objects.select_for_update().get(id=data["ticket_id"])
    profile = getattr(request.user, "mfetms_profile", None)
    if profile and profile.role == UserProfile.Role.SUPPORTER and ticket.user_id != request.user.id:
        return json_response({"error": "You can only pay for your own tickets."}, status=403)
    if ticket.status not in [Ticket.Status.PENDING, Ticket.Status.PAID]:
        return json_response({"error": f"Ticket cannot be paid while it is {ticket.status}."}, status=409)
    if ticket.match.status != Match.Status.SCHEDULED:
        return json_response({"error": f"Payment cannot be made because the match is {ticket.match.status}."}, status=409)
    if ticket.match.date < timezone.localdate():
        ticket.status = Ticket.Status.EXPIRED
        ticket.save(update_fields=["status"])
        return json_response({"error": "Payment cannot be made because the match date has passed."}, status=409)
    if ticket.payments.filter(status=Payment.Status.SUCCESSFUL).exists():
        return json_response({"error": "This ticket already has a successful payment."}, status=409)

    amount = Decimal(str(data.get("amount", ticket.purchase_price)))
    if amount != ticket.purchase_price:
        return json_response({"error": "Payment amount must match the ticket purchase price."}, status=400)

    payment = Payment.objects.create(
        ticket=ticket,
        amount=amount,
        provider=data["provider"],
        transaction_reference=data["transaction_reference"],
        status=data.get("status", Payment.Status.SUCCESSFUL),
    )
    if payment.status == Payment.Status.SUCCESSFUL:
        ticket.status = Ticket.Status.PAID
        ticket.save(update_fields=["status"])
        calculate_match_distribution(ticket.match_id)
    elif payment.status == Payment.Status.FAILED:
        ticket.status = Ticket.Status.CANCELLED
        ticket.save(update_fields=["status"])
        release_ticket_inventory(ticket)
    return json_response({"payment_id": payment.id, "ticket_status": ticket.status}, status=201)

# Create your views here.
