from django.db import models


class Stadium(models.Model):
    name = models.CharField(max_length=180, unique=True)
    city = models.CharField(max_length=80)
    district = models.CharField(max_length=80)
    capacity = models.PositiveIntegerField()
    number_of_gates = models.PositiveIntegerField()
    owner = models.ForeignKey("organizations.Organization", on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

# Create your models here.
