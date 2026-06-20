from django.views.decorators.csrf import csrf_exempt

from accounts.models import UserProfile
from competitions.models import Competition
from mfetms.api import json_response, list_view, request_data, require_methods, require_roles, serialize

from .models import Match


@csrf_exempt
def matches(request):
    if request.method == "POST":
        error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN])
        if error:
            return error
        data = request_data(request)
        profile = getattr(request.user, "mfetms_profile", None)
        competition = Competition.objects.get(id=data["competition_id"])
        if profile and profile.role == UserProfile.Role.SULOM_ADMIN and competition.organizer_id != profile.organization_id:
            return json_response({"error": "SULOM administrators can only create fixtures for SULOM competitions."}, status=403)
        if str(data["home_team_id"]) == str(data["away_team_id"]):
            return json_response({"error": "Home and away teams must be different."}, status=400)
        match = Match.objects.create(
            competition_id=data["competition_id"],
            home_team_id=data["home_team_id"],
            away_team_id=data["away_team_id"],
            stadium_id=data["stadium_id"],
            match_day=data["match_day"],
            date=data["date"],
            kickoff_time=data["kickoff_time"],
            status=data.get("status", Match.Status.SCHEDULED),
            created_by=request.user,
        )
        return json_response(serialize(match), status=201)
    method_error = require_methods(request, ["GET", "POST"])
    if method_error:
        return method_error
    if request.user.is_authenticated:
        error = require_roles(request, [
            UserProfile.Role.SUPER_ADMIN,
            UserProfile.Role.SULOM_ADMIN,
            UserProfile.Role.CLUB_ADMIN,
            UserProfile.Role.TICKET_OFFICER,
            UserProfile.Role.SUPPORTER,
        ])
        if error:
            return error
    queryset = Match.objects.select_related(
        "competition",
        "home_team__organization",
        "away_team__organization",
        "stadium",
        "created_by",
    ).order_by("date", "kickoff_time")

    profile = getattr(request.user, "mfetms_profile", None)
    if profile and profile.role == UserProfile.Role.CLUB_ADMIN and profile.organization:
        queryset = queryset.filter(home_team__organization=profile.organization) | queryset.filter(away_team__organization=profile.organization)

    def extra(match):
        return {
            "label": str(match),
            "home_team_name": match.home_team.organization.name,
            "away_team_name": match.away_team.organization.name,
            "ticket_prices": [
                serialize(price)
                for price in match.ticket_prices.select_related("ticket_category").order_by("price")
            ],
        }

    return list_view(queryset, extra=extra)


@csrf_exempt
def match_detail(request, pk):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN])
    if error:
        return error
    match = Match.objects.get(pk=pk)
    if request.method in ["PUT", "PATCH"]:
        data = request_data(request)
        profile = getattr(request.user, "mfetms_profile", None)
        current_competition = Competition.objects.get(id=data.get("competition_id", match.competition_id))
        if profile and profile.role == UserProfile.Role.SULOM_ADMIN:
            if match.competition.organizer_id != profile.organization_id or current_competition.organizer_id != profile.organization_id:
                return json_response({"error": "SULOM administrators can only manage SULOM fixtures."}, status=403)
        home_team_id = data.get("home_team_id", match.home_team_id)
        away_team_id = data.get("away_team_id", match.away_team_id)
        if str(home_team_id) == str(away_team_id):
            return json_response({"error": "Home and away teams must be different."}, status=400)
        for field in ["match_day", "date", "kickoff_time", "status"]:
            if field in data:
                setattr(match, field, data[field])
        for field in ["competition_id", "home_team_id", "away_team_id", "stadium_id"]:
            if field in data:
                setattr(match, field, data[field])
        match.save()
        return json_response(serialize(match))
    if request.method == "DELETE":
        match.delete()
        return json_response({"deleted": True})
    method_error = require_methods(request, ["GET", "PUT", "PATCH", "DELETE"])
    if method_error:
        return method_error
    return json_response(serialize(match))

# Create your views here.
