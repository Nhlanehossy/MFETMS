from django.contrib import admin

from .models import RevenueDistribution, RevenueShareRule


@admin.register(RevenueShareRule)
class RevenueShareRuleAdmin(admin.ModelAdmin):
    list_display = ("name", "fam_percentage", "sulom_percentage", "home_team_percentage", "away_team_percentage", "stadium_percentage", "security_percentage", "active")
    list_filter = ("active",)


@admin.register(RevenueDistribution)
class RevenueDistributionAdmin(admin.ModelAdmin):
    list_display = ("match", "total_revenue", "fam_share", "sulom_share", "home_team_share", "away_team_share", "stadium_share", "security_share", "distribution_date")
    search_fields = ("match__home_team__organization__name", "match__away_team__organization__name")

# Register your models here.
