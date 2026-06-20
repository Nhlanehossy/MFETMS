from django.contrib import admin

from .models import Club


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ("organization", "short_name", "city", "stadium", "coach", "status")
    list_filter = ("city", "status")
    search_fields = ("organization__name", "short_name", "city")

# Register your models here.
