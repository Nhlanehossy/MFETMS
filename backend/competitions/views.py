from django.views.decorators.csrf import csrf_exempt

from accounts.models import UserProfile
from mfetms.api import json_response, list_view, request_data, require_methods, require_roles, serialize

from .models import Competition


@csrf_exempt
def competitions(request):
    if request.method == "POST":
        error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN])
        if error:
            return error
        data = request_data(request)
        profile = getattr(request.user, "mfetms_profile", None)
        if profile and profile.role == UserProfile.Role.SULOM_ADMIN:
            if not profile.organization_id or str(data["organizer_id"]) != str(profile.organization_id):
                return json_response({"error": "SULOM administrators can only create SULOM competitions."}, status=403)
        competition = Competition.objects.create(
            name=data["name"],
            organizer_id=data["organizer_id"],
            season=data["season"],
            competition_type=data["competition_type"],
            start_date=data["start_date"],
            end_date=data["end_date"],
            status=data.get("status", "ACTIVE"),
        )
        return json_response(serialize(competition), status=201)
    method_error = require_methods(request, ["GET", "POST"])
    if method_error:
        return method_error
    if request.user.is_authenticated:
        error = require_roles(request, [
            UserProfile.Role.SUPER_ADMIN,
            UserProfile.Role.SULOM_ADMIN,
            UserProfile.Role.CLUB_ADMIN,
            UserProfile.Role.SUPPORTER,
        ])
        if error:
            return error
    return list_view(Competition.objects.select_related("organizer").order_by("name"))


@csrf_exempt
def competition_detail(request, pk):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN])
    if error:
        return error
    competition = Competition.objects.get(pk=pk)
    if request.method in ["PUT", "PATCH"]:
        data = request_data(request)
        profile = getattr(request.user, "mfetms_profile", None)
        if profile and profile.role == UserProfile.Role.SULOM_ADMIN:
            if competition.organizer_id != profile.organization_id:
                return json_response({"error": "SULOM administrators can only manage SULOM competitions."}, status=403)
            if "organizer_id" in data and str(data["organizer_id"]) != str(profile.organization_id):
                return json_response({"error": "SULOM administrators cannot transfer competitions to another organizer."}, status=403)
        for field in ["name", "season", "competition_type", "start_date", "end_date", "status"]:
            if field in data:
                setattr(competition, field, data[field])
        if "organizer_id" in data:
            competition.organizer_id = data["organizer_id"]
        competition.save()
        return json_response(serialize(competition))
    if request.method == "DELETE":
        competition.delete()
        return json_response({"deleted": True})
    method_error = require_methods(request, ["GET", "PUT", "PATCH", "DELETE"])
    if method_error:
        return method_error
    return json_response(serialize(competition))

# Create your views here.
