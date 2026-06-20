from django.contrib import admin

from .models import Stadium


@admin.register(Stadium)
class StadiumAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "district", "capacity", "number_of_gates", "owner")
    search_fields = ("name", "city", "district")

# Register your models here.
