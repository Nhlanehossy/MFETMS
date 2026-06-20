from django.views.decorators.csrf import csrf_exempt

from accounts.models import UserProfile
from mfetms.api import json_response, list_view, request_data, require_methods, require_roles, serialize

from .models import Stadium


@csrf_exempt
def stadiums(request):
    if request.method == "POST":
        error = require_roles(request, [UserProfile.Role.SUPER_ADMIN])
        if error:
            return error
        data = request_data(request)
        stadium = Stadium.objects.create(
            name=data["name"],
            city=data["city"],
            district=data["district"],
            capacity=data["capacity"],
            number_of_gates=data["number_of_gates"],
            owner_id=data.get("owner_id") or None,
        )
        return json_response(serialize(stadium), status=201)
    method_error = require_methods(request, ["GET", "POST"])
    if method_error:
        return method_error
    if request.user.is_authenticated:
        error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN, UserProfile.Role.CLUB_ADMIN, UserProfile.Role.SUPPORTER])
        if error:
            return error
    return list_view(Stadium.objects.select_related("owner").order_by("name"))


@csrf_exempt
def stadium_detail(request, pk):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN])
    if error:
        return error
    stadium = Stadium.objects.get(pk=pk)
    if request.method in ["PUT", "PATCH"]:
        data = request_data(request)
        for field in ["name", "city", "district", "capacity", "number_of_gates"]:
            if field in data:
                setattr(stadium, field, data[field])
        if "owner_id" in data:
            stadium.owner_id = data.get("owner_id") or None
        stadium.save()
        return json_response(serialize(stadium))
    if request.method == "DELETE":
        stadium.delete()
        return json_response({"deleted": True})
    method_error = require_methods(request, ["GET", "PUT", "PATCH", "DELETE"])
    if method_error:
        return method_error
    return json_response(serialize(stadium))

# Create your views here.
