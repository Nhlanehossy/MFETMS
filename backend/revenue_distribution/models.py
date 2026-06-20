from django.db import models


class RevenueShareRule(models.Model):
    name = models.CharField(max_length=120, default="Default gate collection sharing")
    fam_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5)
    sulom_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    home_team_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=45)
    away_team_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=30)
    stadium_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5)
    security_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class RevenueDistribution(models.Model):
    match = models.OneToOneField("matches.Match", on_delete=models.CASCADE, related_name="revenue_distribution")
    total_revenue = models.DecimalField(max_digits=14, decimal_places=2)
    fam_share = models.DecimalField(max_digits=14, decimal_places=2)
    sulom_share = models.DecimalField(max_digits=14, decimal_places=2)
    home_team_share = models.DecimalField(max_digits=14, decimal_places=2)
    away_team_share = models.DecimalField(max_digits=14, decimal_places=2)
    stadium_share = models.DecimalField(max_digits=14, decimal_places=2)
    security_share = models.DecimalField(max_digits=14, decimal_places=2)
    distribution_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Revenue for {self.match}"

# Create your models here.
