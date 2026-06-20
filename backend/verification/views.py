from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from accounts.models import UserProfile
from matches.models import Match
from mfetms.api import json_response, list_view, request_data, require_methods, require_roles
from tickets.models import Ticket

from .models import VerificationLog


def verification_logs(request):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN, UserProfile.Role.TICKET_OFFICER])
    if error:
        return error
    return list_view(VerificationLog.objects.select_related("ticket", "verified_by").order_by("-verification_time"))


@csrf_exempt
@transaction.atomic
def verify_ticket(request):
    error = require_methods(request, ["POST"])
    if error:
        return error

    role_error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN, UserProfile.Role.TICKET_OFFICER])
    if role_error:
        return role_error

    data = request_data(request)
    ticket = Ticket.objects.select_for_update().select_related("match", "match__stadium").filter(qr_code=data["qr_code"]).first()
    officer = User.objects.filter(id=data.get("verified_by_id")).first() if data.get("verified_by_id") else request.user
    gate_number = int(data["gate_number"])

    if not ticket:
        log = VerificationLog.objects.create(
            verified_by=officer,
            gate_number=gate_number,
            status=VerificationLog.Status.INVALID,
        )
        return json_response({"verification_id": log.id, "status": log.status, "message": "Ticket QR code was not found."}, status=404)

    if gate_number < 1 or gate_number > ticket.match.stadium.number_of_gates:
        status = VerificationLog.Status.INVALID
        message = f"Gate number must be between 1 and {ticket.match.stadium.number_of_gates}."
    elif ticket.match.status in [Match.Status.CANCELLED, Match.Status.POSTPONED]:
        status = VerificationLog.Status.INVALID
        message = f"Match is {ticket.match.status}."
    elif ticket.match.date > timezone.localdate():
        status = VerificationLog.Status.INVALID
        message = "Ticket can only be verified on match day."
    elif ticket.match.date < timezone.localdate():
        ticket.status = Ticket.Status.EXPIRED
        ticket.save(update_fields=["status"])
        status = VerificationLog.Status.EXPIRED
        message = "Ticket has expired because the match date has passed."
    elif ticket.status == Ticket.Status.USED:
        status = VerificationLog.Status.USED
        message = "Ticket has already been used."
    elif ticket.status != Ticket.Status.PAID:
        status = VerificationLog.Status.INVALID
        message = f"Ticket is {ticket.status}, not PAID."
    else:
        ticket.status = Ticket.Status.USED
        ticket.save(update_fields=["status"])
        status = VerificationLog.Status.VALID
        message = "Ticket verified successfully."

    log = VerificationLog.objects.create(ticket=ticket, verified_by=officer, gate_number=gate_number, status=status)
    return json_response({"verification_id": log.id, "status": status, "message": message})

# Create your views here.
