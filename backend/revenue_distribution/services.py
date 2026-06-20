from decimal import Decimal

from django.db.models import Sum

from payments.models import Payment

from .models import RevenueDistribution, RevenueShareRule


def calculate_match_distribution(match_id):
    rule = RevenueShareRule.objects.filter(active=True).first()
    if not rule:
        return None

    total = Payment.objects.filter(
        ticket__match_id=match_id,
        status=Payment.Status.SUCCESSFUL,
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

    def share(percent):
        return total * Decimal(percent) / Decimal("100")

    distribution, _ = RevenueDistribution.objects.update_or_create(
        match_id=match_id,
        defaults={
            "total_revenue": total,
            "fam_share": share(rule.fam_percentage),
            "sulom_share": share(rule.sulom_percentage),
            "home_team_share": share(rule.home_team_percentage),
            "away_team_share": share(rule.away_team_percentage),
            "stadium_share": share(rule.stadium_percentage),
            "security_share": share(rule.security_percentage),
        },
    )
    return distribution
