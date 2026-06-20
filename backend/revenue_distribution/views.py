from django.views.decorators.csrf import csrf_exempt

from accounts.models import UserProfile
from mfetms.api import json_response, list_view, request_data, require_methods, require_roles

from .models import RevenueDistribution, RevenueShareRule
from .services import calculate_match_distribution


@csrf_exempt
def revenue_share_rules(request):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN])
    if error:
        return error
    if request.method == "POST":
        data = request_data(request)
        validation_error = validate_share_rule(data)
        if validation_error:
            return validation_error
        if data.get("active", True):
            RevenueShareRule.objects.update(active=False)
        rule = RevenueShareRule.objects.create(
            name=data.get("name", "Gate collection sharing"),
            fam_percentage=data["fam_percentage"],
            sulom_percentage=data["sulom_percentage"],
            home_team_percentage=data["home_team_percentage"],
            away_team_percentage=data["away_team_percentage"],
            stadium_percentage=data["stadium_percentage"],
            security_percentage=data["security_percentage"],
            active=data.get("active", True),
        )
        return json_response({"id": rule.id, "name": rule.name}, status=201)
    method_error = require_methods(request, ["GET", "POST"])
    if method_error:
        return method_error
    return list_view(RevenueShareRule.objects.order_by("-active", "name"))


@csrf_exempt
def revenue_share_rule_detail(request, pk):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN])
    if error:
        return error
    rule = RevenueShareRule.objects.get(pk=pk)
    if request.method in ["PUT", "PATCH"]:
        data = request_data(request)
        merged = {
            "fam_percentage": data.get("fam_percentage", rule.fam_percentage),
            "sulom_percentage": data.get("sulom_percentage", rule.sulom_percentage),
            "home_team_percentage": data.get("home_team_percentage", rule.home_team_percentage),
            "away_team_percentage": data.get("away_team_percentage", rule.away_team_percentage),
            "stadium_percentage": data.get("stadium_percentage", rule.stadium_percentage),
            "security_percentage": data.get("security_percentage", rule.security_percentage),
        }
        validation_error = validate_share_rule(merged)
        if validation_error:
            return validation_error
        for field in ["name", "fam_percentage", "sulom_percentage", "home_team_percentage", "away_team_percentage", "stadium_percentage", "security_percentage", "active"]:
            if field in data:
                setattr(rule, field, data[field])
        if rule.active:
            RevenueShareRule.objects.exclude(pk=rule.pk).update(active=False)
        rule.save()
        return json_response({"id": rule.id, "name": rule.name})
    if request.method == "DELETE":
        if rule.active:
            return json_response({"error": "Active revenue share rule cannot be deleted."}, status=409)
        rule.delete()
        return json_response({"deleted": True})
    method_error = require_methods(request, ["GET", "PUT", "PATCH", "DELETE"])
    if method_error:
        return method_error
    return json_response({"id": rule.id, "name": rule.name})


def validate_share_rule(data):
    fields = ["fam_percentage", "sulom_percentage", "home_team_percentage", "away_team_percentage", "stadium_percentage", "security_percentage"]
    total = sum(float(data[field]) for field in fields)
    if round(total, 2) != 100:
        return json_response({"error": "Revenue sharing percentages must total 100%."}, status=400)
    return None


def revenue_distributions(request):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN, UserProfile.Role.CLUB_ADMIN])
    if error:
        return error
    queryset = RevenueDistribution.objects.select_related("match", "match__home_team__organization", "match__away_team__organization").order_by("-distribution_date")
    profile = getattr(request.user, "mfetms_profile", None)
    if profile and profile.role == UserProfile.Role.CLUB_ADMIN and profile.organization:
        queryset = queryset.filter(match__home_team__organization=profile.organization) | queryset.filter(match__away_team__organization=profile.organization)
    return list_view(queryset)


@csrf_exempt
def calculate_distribution(request):
    error = require_methods(request, ["POST"])
    if error:
        return error

    role_error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN])
    if role_error:
        return role_error

    match_id = request_data(request)["match_id"]
    distribution = calculate_match_distribution(match_id)
    if not distribution:
        return json_response({"error": "No active revenue share rule configured."}, status=400)
    return json_response({"distribution_id": distribution.id, "total_revenue": distribution.total_revenue})

# Create your views here.
