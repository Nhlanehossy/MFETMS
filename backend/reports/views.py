from django.db.models import Count, Sum

from accounts.models import UserProfile
from mfetms.api import json_response, require_roles
from matches.models import Match
from payments.models import Payment
from tickets.models import Ticket


def reports_summary(request):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN, UserProfile.Role.CLUB_ADMIN])
    if error:
        return error
    matches = Match.objects.all()
    tickets = Ticket.objects.all()
    payments = Payment.objects.all()
    profile = getattr(request.user, "mfetms_profile", None)
    if profile and profile.role == UserProfile.Role.CLUB_ADMIN and profile.organization:
        matches = matches.filter(home_team__organization=profile.organization) | matches.filter(away_team__organization=profile.organization)
        tickets = tickets.filter(match__in=matches)
        payments = payments.filter(ticket__match__in=matches)
    paid_tickets = tickets.filter(status__in=[Ticket.Status.PAID, Ticket.Status.USED])
    revenue = payments.filter(status=Payment.Status.SUCCESSFUL).aggregate(total=Sum("amount"))["total"] or 0
    attendance_by_competition = list(
        matches.values("competition__name")
        .annotate(attendance=Count("tickets"))
        .order_by("competition__name")
    )
    club_home_attendance = list(
        matches.values("home_team__organization__name")
        .annotate(home_tickets=Count("tickets"))
        .order_by("home_team__organization__name")
    )
    return json_response(
        {
            "national": {
                "matches": matches.count(),
                "tickets_sold": paid_tickets.count(),
                "total_revenue": revenue,
            },
            "fam": {
                "national_attendance": paid_tickets.count(),
                "competition_revenue": revenue,
                "seasonal_statistics": attendance_by_competition,
            },
            "sulom": {
                "league_attendance": paid_tickets.filter(match__competition__organizer__organization_type="SULOM").count(),
                "match_revenue": revenue,
            },
            "clubs": club_home_attendance,
        }
    )

# Create your views here.
