from django.contrib import admin

from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "organization", "phone", "status")
    list_filter = ("role", "status")
    search_fields = ("user__username", "user__email", "organization__name")

# Register your models here.
