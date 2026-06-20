import json
from decimal import Decimal

from django.core.serializers.json import DjangoJSONEncoder
from django.forms.models import model_to_dict
from django.http import HttpResponseNotAllowed, JsonResponse


class ApiEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)


def json_response(data, status=200):
    return JsonResponse(data, status=status, encoder=ApiEncoder, safe=not isinstance(data, list))


def request_data(request):
    if not request.body:
        return {}
    return json.loads(request.body.decode("utf-8"))


def serialize(instance, fields=None, extra=None):
    data = model_to_dict(instance, fields=fields)
    data["id"] = instance.pk
    for field in instance._meta.fields:
        if field.name in data and field.is_relation and getattr(instance, field.name + "_id", None):
            related = getattr(instance, field.name)
            data[field.name] = {"id": related.pk, "name": str(related)}
    if extra:
        data.update(extra(instance))
    return data


def list_view(queryset, fields=None, extra=None):
    return json_response([serialize(item, fields=fields, extra=extra) for item in queryset])


def require_methods(request, methods):
    if request.method not in methods:
        return HttpResponseNotAllowed(methods)
    return None


def user_role(user):
    if not user.is_authenticated:
        return None
    profile = getattr(user, "mfetms_profile", None)
    return profile.role if profile else None


ROLE_PORTALS = {
    "SUPER_ADMIN": ["fam", "sulom", "club", "supporter", "officer"],
    "SULOM_ADMIN": ["sulom", "club", "supporter", "officer"],
    "CLUB_ADMIN": ["club", "supporter"],
    "TICKET_OFFICER": ["officer"],
    "SUPPORTER": ["supporter"],
}

ROLE_DEFAULT_PATH = {
    "SUPER_ADMIN": "/fam",
    "SULOM_ADMIN": "/sulom",
    "CLUB_ADMIN": "/club",
    "TICKET_OFFICER": "/officer/scanner",
    "SUPPORTER": "/supporter",
}


def allowed_portals(user):
    return ROLE_PORTALS.get(user_role(user), [])


def default_path(user):
    return ROLE_DEFAULT_PATH.get(user_role(user), "/login")


def require_roles(request, roles):
    if not request.user.is_authenticated:
        return json_response({"error": "Login is required."}, status=401)
    role = user_role(request.user)
    if role not in roles:
        return json_response({"error": "You do not have permission to access this resource."}, status=403)
    return None
