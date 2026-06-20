"""
URL configuration for mfetms project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from accounts import views as account_views
from clubs import views as club_views
from competitions import views as competition_views
from django.contrib import admin
from django.urls import path
from mfetms import site
from matches import views as match_views
from organizations import views as organization_views
from payments import views as payment_views
from reports import views as report_views
from revenue_distribution import views as revenue_views
from stadiums import views as stadium_views
from ticket_categories import views as ticket_category_views
from tickets import views as ticket_views
from verification import views as verification_views

urlpatterns = [
    path('', site.website),
    path('assets/<path:path>', site.frontend_asset),
    path('admin/', admin.site.urls),
    path('api/auth/me/', account_views.me),
    path('api/auth/login/', account_views.login_view),
    path('api/auth/register/', account_views.register_view),
    path('api/auth/logout/', account_views.logout_view),
    path('api/users/', account_views.users),
    path('api/users/<int:pk>/', account_views.user_detail),
    path('api/profiles/', account_views.profiles),
    path('api/organizations/', organization_views.organizations),
    path('api/organizations/<int:pk>/', organization_views.organization_detail),
    path('api/competitions/', competition_views.competitions),
    path('api/competitions/<int:pk>/', competition_views.competition_detail),
    path('api/clubs/', club_views.clubs),
    path('api/clubs/<int:pk>/', club_views.club_detail),
    path('api/stadiums/', stadium_views.stadiums),
    path('api/stadiums/<int:pk>/', stadium_views.stadium_detail),
    path('api/matches/', match_views.matches),
    path('api/matches/<int:pk>/', match_views.match_detail),
    path('api/ticket-categories/', ticket_category_views.ticket_categories),
    path('api/ticket-categories/<int:pk>/', ticket_category_views.ticket_category_detail),
    path('api/match-ticket-prices/', ticket_category_views.match_ticket_prices),
    path('api/match-ticket-prices/<int:pk>/', ticket_category_views.match_ticket_price_detail),
    path('api/tickets/', ticket_views.tickets),
    path('api/tickets/<int:pk>/download/', ticket_views.download_ticket),
    path('api/tickets/purchase/', ticket_views.purchase_ticket),
    path('api/payments/', payment_views.payments),
    path('api/payments/record/', payment_views.record_payment),
    path('api/revenue-share-rules/', revenue_views.revenue_share_rules),
    path('api/revenue-share-rules/<int:pk>/', revenue_views.revenue_share_rule_detail),
    path('api/revenue-distributions/', revenue_views.revenue_distributions),
    path('api/revenue-distributions/calculate/', revenue_views.calculate_distribution),
    path('api/verification-logs/', verification_views.verification_logs),
    path('api/verification/scan/', verification_views.verify_ticket),
    path('api/reports/summary/', report_views.reports_summary),
    path('<path:path>', site.website),
]
