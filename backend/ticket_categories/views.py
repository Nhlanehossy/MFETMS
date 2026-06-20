from django.views.decorators.csrf import csrf_exempt

from accounts.models import UserProfile
from matches.models import Match
from mfetms.api import json_response, list_view, request_data, require_methods, require_roles, serialize

from .models import MatchTicketPrice, TicketCategory


@csrf_exempt
def ticket_categories(request):
    if request.method == "POST":
        error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN])
        if error:
            return error
        data = request_data(request)
        category = TicketCategory.objects.create(name=data["name"], description=data.get("description", ""))
        return json_response(serialize(category), status=201)
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
    return list_view(TicketCategory.objects.order_by("name"))


@csrf_exempt
def match_ticket_prices(request):
    if request.method == "POST":
        error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN])
        if error:
            return error
        data = request_data(request)
        profile = getattr(request.user, "mfetms_profile", None)
        match = Match.objects.get(id=data["match_id"])
        if profile and profile.role == UserProfile.Role.SULOM_ADMIN and match.competition.organizer_id != profile.organization_id:
            return json_response({"error": "SULOM administrators can only price SULOM fixtures."}, status=403)
        price = MatchTicketPrice.objects.create(
            match_id=data["match_id"],
            ticket_category_id=data["ticket_category_id"],
            price=data["price"],
            quantity=data["quantity"],
            available_quantity=data.get("available_quantity", data["quantity"]),
        )
        return json_response(serialize(price), status=201)
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
    return list_view(MatchTicketPrice.objects.select_related("match", "ticket_category").order_by("match_id", "price"))


@csrf_exempt
def ticket_category_detail(request, pk):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN])
    if error:
        return error
    category = TicketCategory.objects.get(pk=pk)
    if request.method in ["PUT", "PATCH"]:
        data = request_data(request)
        for field in ["name", "description"]:
            if field in data:
                setattr(category, field, data[field])
        category.save()
        return json_response(serialize(category))
    if request.method == "DELETE":
        category.delete()
        return json_response({"deleted": True})
    method_error = require_methods(request, ["GET", "PUT", "PATCH", "DELETE"])
    if method_error:
        return method_error
    return json_response(serialize(category))


@csrf_exempt
def match_ticket_price_detail(request, pk):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN])
    if error:
        return error
    price = MatchTicketPrice.objects.get(pk=pk)
    if request.method in ["PUT", "PATCH"]:
        data = request_data(request)
        for field in ["price", "quantity", "available_quantity"]:
            if field in data:
                setattr(price, field, data[field])
        if "match_id" in data:
            price.match_id = data["match_id"]
        if "ticket_category_id" in data:
            price.ticket_category_id = data["ticket_category_id"]
        price.save()
        return json_response(serialize(price))
    if request.method == "DELETE":
        price.delete()
        return json_response({"deleted": True})
    method_error = require_methods(request, ["GET", "PUT", "PATCH", "DELETE"])
    if method_error:
        return method_error
    return json_response(serialize(price))

# Create your views here.
