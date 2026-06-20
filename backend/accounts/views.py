from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt

from mfetms.api import allowed_portals, default_path, json_response, list_view, request_data, require_methods, require_roles

from .models import UserProfile


def bool_value(value, default=True):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).lower() in ["1", "true", "yes", "on"]


def user_payload(user):
    profile = getattr(user, "mfetms_profile", None)
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_staff": user.is_staff,
        "role": profile.role if profile else "",
        "organization": profile.organization.name if profile and profile.organization else "",
        "allowed_portals": allowed_portals(user),
        "default_path": default_path(user),
    }


def user_admin_payload(user):
    profile = getattr(user, "mfetms_profile", None)
    return {
        **user_payload(user),
        "is_active": user.is_active,
        "organization_id": profile.organization_id if profile else None,
        "phone": profile.phone if profile else "",
        "status": profile.status if profile else "",
    }


@csrf_exempt
def users(request):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN])
    if error:
        return error
    if request.method == "POST":
        data = request_data(request)
        username = data.get("username") or data.get("email")
        password = data.get("password") or "Password123!"
        if not username:
            return json_response({"error": "Username or email is required."}, status=400)
        if User.objects.filter(username=username).exists():
            return json_response({"error": "Username already exists."}, status=409)
        user = User.objects.create_user(
            username=username,
            email=data.get("email", ""),
            password=password,
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            is_active=bool_value(data.get("is_active"), True),
        )
        role = data.get("role", UserProfile.Role.SUPPORTER)
        UserProfile.objects.create(
            user=user,
            role=role,
            organization_id=data.get("organization_id") or None,
            phone=data.get("phone", ""),
            status=data.get("status", "ACTIVE"),
        )
        user.is_staff = role in [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN]
        user.is_superuser = role == UserProfile.Role.SUPER_ADMIN
        user.save(update_fields=["is_staff", "is_superuser"])
        return json_response(user_admin_payload(user), status=201)
    method_error = require_methods(request, ["GET", "POST"])
    if method_error:
        return method_error
    return json_response([user_admin_payload(user) for user in User.objects.select_related("mfetms_profile__organization").order_by("username")])


@csrf_exempt
def user_detail(request, pk):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN])
    if error:
        return error
    user = User.objects.select_related("mfetms_profile__organization").get(pk=pk)
    if request.method in ["PUT", "PATCH"]:
        data = request_data(request)
        for field in ["username", "email", "first_name", "last_name", "is_active"]:
            if field in data:
                setattr(user, field, bool_value(data[field], True) if field == "is_active" else data[field])
        if data.get("password"):
            user.set_password(data["password"])
        profile = getattr(user, "mfetms_profile", None)
        if not profile:
            profile = UserProfile.objects.create(user=user, role=UserProfile.Role.SUPPORTER)
        for field in ["role", "phone", "status"]:
            if field in data:
                setattr(profile, field, data[field])
        if "organization_id" in data:
            profile.organization_id = data.get("organization_id") or None
        user.is_staff = profile.role in [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN]
        user.is_superuser = profile.role == UserProfile.Role.SUPER_ADMIN
        user.save()
        profile.save()
        return json_response(user_admin_payload(user))
    if request.method == "DELETE":
        if user.id == request.user.id:
            return json_response({"error": "You cannot delete your own account."}, status=409)
        user.delete()
        return json_response({"deleted": True})
    method_error = require_methods(request, ["GET", "PUT", "PATCH", "DELETE"])
    if method_error:
        return method_error
    return json_response(user_admin_payload(user))


def profiles(request):
    error = require_roles(request, [UserProfile.Role.SUPER_ADMIN])
    if error:
        return error
    return list_view(UserProfile.objects.select_related("user", "organization").order_by("role", "user__username"))


def me(request):
    if not request.user.is_authenticated:
        return json_response({"authenticated": False, "user": None})
    return json_response({"authenticated": True, "user": user_payload(request.user)})


@csrf_exempt
def login_view(request):
    error = require_methods(request, ["POST"])
    if error:
        return error

    data = request_data(request)
    user = authenticate(request, username=data.get("username", ""), password=data.get("password", ""))
    if not user:
        return json_response({"error": "Invalid username or password."}, status=400)
    if not user.is_active:
        return json_response({"error": "This account is inactive."}, status=403)

    login(request, user)
    return json_response({"authenticated": True, "user": user_payload(user)})


@csrf_exempt
@transaction.atomic
def register_view(request):
    error = require_methods(request, ["POST"])
    if error:
        return error

    data = request_data(request)
    username = data.get("username") or data.get("email")
    password = data.get("password")
    if not username or not password:
        return json_response({"error": "Username/email and password are required."}, status=400)
    if User.objects.filter(username=username).exists():
        return json_response({"error": "An account with this username already exists."}, status=409)
    if data.get("email") and User.objects.filter(email=data["email"]).exists():
        return json_response({"error": "An account with this email already exists."}, status=409)

    user = User.objects.create_user(
        username=username,
        email=data.get("email", ""),
        password=password,
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
    )
    UserProfile.objects.create(
        user=user,
        role=UserProfile.Role.SUPPORTER,
        phone=data.get("phone", ""),
        status="ACTIVE",
    )
    login(request, user)
    return json_response({"authenticated": True, "user": user_payload(user)}, status=201)


@csrf_exempt
def logout_view(request):
    error = require_methods(request, ["POST"])
    if error:
        return error
    logout(request)
    return json_response({"authenticated": False, "user": None})

# Create your views here.
