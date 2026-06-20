from django.contrib import admin

from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "short_name", "organization_type", "email", "status")
    list_filter = ("organization_type", "status")
    search_fields = ("name", "short_name", "email")

# Register your models here.
