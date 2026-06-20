from django.views.decorators.csrf import csrf_exempt

from accounts.models import UserProfile
from mfetms.api import json_response, list_view, request_data, require_methods, require_roles, serialize

from .models import Organization


@csrf_exempt
def organizations(request):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN])
    if error:
        return error
    if request.method == "POST":
        data = request_data(request)
        organization = Organization.objects.create(
            name=data["name"],
            short_name=data["short_name"],
            organization_type=data["organization_type"],
            email=data.get("email", ""),
            phone=data.get("phone", ""),
            address=data.get("address", ""),
            logo=data.get("logo", ""),
            website=data.get("website", ""),
            status=data.get("status", "ACTIVE"),
        )
        return json_response(serialize(organization), status=201)
    method_error = require_methods(request, ["GET", "POST"])
    if method_error:
        return method_error
    return list_view(Organization.objects.order_by("organization_type", "name"))


@csrf_exempt
def organization_detail(request, pk):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN])
    if error:
        return error
    organization = Organization.objects.get(pk=pk)
    if request.method in ["PUT", "PATCH"]:
        data = request_data(request)
        for field in ["name", "short_name", "organization_type", "email", "phone", "address", "logo", "website", "status"]:
            if field in data:
                setattr(organization, field, data[field])
        organization.save()
        return json_response(serialize(organization))
    if request.method == "DELETE":
        organization.delete()
        return json_response({"deleted": True})
    method_error = require_methods(request, ["GET", "PUT", "PATCH", "DELETE"])
    if method_error:
        return method_error
    return json_response(serialize(organization))

# Create your views here.
