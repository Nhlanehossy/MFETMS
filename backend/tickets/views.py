from django.db import transaction
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from accounts.models import UserProfile
from matches.models import Match
from mfetms.api import json_response, list_view, request_data, require_methods, require_roles
from ticket_categories.models import MatchTicketPrice, TicketCategory

from .models import Ticket


def tickets(request):
    error = require_roles(request, [
        UserProfile.Role.SUPER_ADMIN,
        UserProfile.Role.SULOM_ADMIN,
        UserProfile.Role.CLUB_ADMIN,
        UserProfile.Role.TICKET_OFFICER,
        UserProfile.Role.SUPPORTER,
    ])
    if error:
        return error
    queryset = Ticket.objects.select_related("user", "match", "category", "match__home_team__organization", "match__away_team__organization").order_by("-purchase_date")
    profile = getattr(request.user, "mfetms_profile", None)
    if profile and profile.role == UserProfile.Role.SUPPORTER:
        queryset = queryset.filter(user=request.user)
    elif profile and profile.role == UserProfile.Role.CLUB_ADMIN and profile.organization:
        queryset = queryset.filter(match__home_team__organization=profile.organization) | queryset.filter(match__away_team__organization=profile.organization)
    return list_view(queryset)


def download_ticket(request, pk):
    error = require_roles(request, [
        UserProfile.Role.SUPER_ADMIN,
        UserProfile.Role.SULOM_ADMIN,
        UserProfile.Role.CLUB_ADMIN,
        UserProfile.Role.TICKET_OFFICER,
        UserProfile.Role.SUPPORTER,
    ])
    if error:
        return error
    ticket = Ticket.objects.select_related(
        "user",
        "match",
        "match__competition",
        "match__home_team__organization",
        "match__away_team__organization",
        "match__stadium",
        "category",
    ).get(pk=pk)
    profile = getattr(request.user, "mfetms_profile", None)
    if profile and profile.role == UserProfile.Role.SUPPORTER and ticket.user_id != request.user.id:
        return json_response({"error": "You can only download your own tickets."}, status=403)
    if profile and profile.role == UserProfile.Role.CLUB_ADMIN and profile.organization:
        if ticket.match.home_team.organization_id != profile.organization_id and ticket.match.away_team.organization_id != profile.organization_id:
            return json_response({"error": "You can only download tickets for your club matches."}, status=403)

    html = f"""<!doctype html>
<html>
<head><meta charset="utf-8"><title>{ticket.ticket_number}</title></head>
<body style="font-family:Arial,sans-serif;padding:32px;color:#1E1E1E">
  <h1>MFETMS E-Ticket</h1>
  <h2>{ticket.match.home_team.organization.name} vs {ticket.match.away_team.organization.name}</h2>
  <p><strong>Ticket:</strong> {ticket.ticket_number}</p>
  <p><strong>Holder:</strong> {ticket.user.get_full_name() or ticket.user.username}</p>
  <p><strong>Competition:</strong> {ticket.match.competition.name}</p>
  <p><strong>Stadium:</strong> {ticket.match.stadium.name}</p>
  <p><strong>Date:</strong> {ticket.match.date} {ticket.match.kickoff_time}</p>
  <p><strong>Category:</strong> {ticket.category.name}</p>
  <p><strong>Seat:</strong> {ticket.seat_number}</p>
  <p><strong>Status:</strong> {ticket.status}</p>
  <div style="margin-top:24px;padding:24px;border:2px dashed #006B3F;width:360px;text-align:center">
    <strong>QR CODE</strong>
    <p style="word-break:break-all">{ticket.qr_code}</p>
  </div>
</body>
</html>"""
    response = HttpResponse(html, content_type="text/html")
    response["Content-Disposition"] = f'attachment; filename="{ticket.ticket_number}.html"'
    return response


@csrf_exempt
@transaction.atomic
def purchase_ticket(request):
    error = require_methods(request, ["POST"])
    if error:
        return error

    error = require_roles(request, [UserProfile.Role.SUPPORTER])
    if error:
        return error

    data = request_data(request)
    match_price = MatchTicketPrice.objects.select_for_update().get(
        match_id=data["match_id"],
        ticket_category_id=data["category_id"],
    )
    match = match_price.match
    if match.status != Match.Status.SCHEDULED:
        return json_response({"error": f"Tickets can only be bought for scheduled matches. This match is {match.status}."}, status=409)
    if match_price.available_quantity < 1:
        return json_response({"error": "Selected ticket category is sold out."}, status=409)
    seat_number = data.get("seat_number", "").strip()
    if not seat_number or seat_number.upper() == "AUTO":
        sold_count = match_price.quantity - match_price.available_quantity + 1
        seat_number = f"{match_price.ticket_category.name[:3].upper()}-{sold_count:05d}"
    if Ticket.objects.filter(match_id=data["match_id"], seat_number=seat_number).exclude(status__in=[Ticket.Status.CANCELLED, Ticket.Status.REFUNDED]).exists():
        return json_response({"error": "This seat number has already been issued for the match."}, status=409)

    ticket = Ticket.objects.create(
        user=request.user,
        match_id=data["match_id"],
        category=TicketCategory.objects.get(id=data["category_id"]),
        seat_number=seat_number,
        purchase_price=match_price.price,
    )
    match_price.available_quantity -= 1
    match_price.save(update_fields=["available_quantity"])
    return json_response({"ticket_id": ticket.id, "ticket_number": ticket.ticket_number, "qr_code": ticket.qr_code}, status=201)

# Create your views here.
