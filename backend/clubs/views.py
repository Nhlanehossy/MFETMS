from django.views.decorators.csrf import csrf_exempt

from accounts.models import UserProfile
from mfetms.api import json_response, list_view, request_data, require_methods, require_roles, serialize

from .models import Club


@csrf_exempt
def clubs(request):
    if request.method == "POST":
        error = require_roles(request, [UserProfile.Role.SUPER_ADMIN])
        if error:
            return error
        data = request_data(request)
        club = Club.objects.create(
            organization_id=data["organization_id"],
            short_name=data["short_name"],
            city=data["city"],
            founded_year=data.get("founded_year") or None,
            stadium_id=data.get("stadium_id") or None,
            coach=data.get("coach", ""),
            logo=data.get("logo", ""),
            status=data.get("status", "ACTIVE"),
        )
        return json_response(serialize(club), status=201)
    method_error = require_methods(request, ["GET", "POST"])
    if method_error:
        return method_error
    if request.user.is_authenticated:
        error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN, UserProfile.Role.CLUB_ADMIN, UserProfile.Role.SUPPORTER])
        if error:
            return error
    queryset = Club.objects.select_related("organization", "stadium").order_by("organization__name")
    if getattr(request.user, "mfetms_profile", None) and request.user.mfetms_profile.role == UserProfile.Role.CLUB_ADMIN and request.user.mfetms_profile.organization:
        queryset = queryset.filter(organization=request.user.mfetms_profile.organization)
    return list_view(queryset)


@csrf_exempt
def club_detail(request, pk):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.CLUB_ADMIN])
    if error:
        return error
    club = Club.objects.get(pk=pk)
    profile = getattr(request.user, "mfetms_profile", None)
    if profile and profile.role == UserProfile.Role.CLUB_ADMIN and club.organization_id != profile.organization_id:
        return json_response({"error": "You can only manage your own club."}, status=403)
    if request.method in ["PUT", "PATCH"]:
        data = request_data(request)
        for field in ["short_name", "city", "founded_year", "coach", "logo", "status"]:
            if field in data:
                setattr(club, field, data[field] or None if field == "founded_year" else data[field])
        if "organization_id" in data and profile.role == UserProfile.Role.SUPER_ADMIN:
            club.organization_id = data["organization_id"]
        if "stadium_id" in data:
            club.stadium_id = data.get("stadium_id") or None
        club.save()
        return json_response(serialize(club))
    if request.method == "DELETE":
        if profile and profile.role != UserProfile.Role.SUPER_ADMIN:
            return json_response({"error": "Only FAM can delete clubs."}, status=403)
        club.delete()
        return json_response({"deleted": True})
    method_error = require_methods(request, ["GET", "PUT", "PATCH", "DELETE"])
    if method_error:
        return method_error
    return json_response(serialize(club))

# Create your views here.
