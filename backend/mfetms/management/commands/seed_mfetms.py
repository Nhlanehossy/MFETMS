from datetime import date, time
from decimal import Decimal

from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand

from accounts.models import UserProfile
from clubs.models import Club
from competitions.models import Competition
from matches.models import Match
from organizations.models import Organization
from payments.models import Payment
from revenue_distribution.models import RevenueDistribution, RevenueShareRule
from stadiums.models import Stadium
from ticket_categories.models import MatchTicketPrice, TicketCategory
from tickets.models import Ticket
from verification.models import VerificationLog


class Command(BaseCommand):
    help = "Seed MFETMS with Malawi football organizations, competitions, clubs, fixtures, tickets, and reports data."

    def handle(self, *args, **options):
        self.seed_roles()
        organizations = self.seed_organizations()
        stadiums = self.seed_stadiums(organizations)
        clubs = self.seed_clubs(organizations, stadiums)
        users = self.seed_users(organizations)
        competitions = self.seed_competitions(organizations)
        matches = self.seed_matches(competitions, clubs, stadiums, users)
        categories = self.seed_ticket_categories()
        self.seed_ticket_prices(matches, categories)
        tickets = self.seed_tickets(matches, categories, users)
        self.seed_revenue(tickets, matches)
        self.seed_verification(tickets, users)
        self.stdout.write(self.style.SUCCESS("MFETMS seed data loaded successfully."))

    def seed_roles(self):
        for role, label in UserProfile.Role.choices:
            Group.objects.get_or_create(name=label)

    def seed_organizations(self):
        rows = [
            ("Football Association of Malawi", "FAM", Organization.Type.FAM, "info@fam.mw", "+265 1 774 099", "Chiwembe, Blantyre", "https://fam.mw"),
            ("Super League of Malawi", "SULOM", Organization.Type.SULOM, "info@sulom.mw", "+265 1 822 044", "Lilongwe", "https://sulom.mw"),
            ("Southern Region Football Association", "SRFA", Organization.Type.REGIONAL_ASSOCIATION, "srfa@fam.mw", "+265 1 870 100", "Blantyre", ""),
            ("FCB Nyasa Bullets", "Bullets", Organization.Type.CLUB, "info@nyasabullets.com", "+265 999 100 001", "Blantyre", "https://nyasabullets.com"),
            ("Mighty Mukuru Wanderers", "Wanderers", Organization.Type.CLUB, "info@mightywanderers.mw", "+265 999 100 002", "Blantyre", ""),
            ("Silver Strikers", "Silver", Organization.Type.CLUB, "info@silverstrikers.mw", "+265 999 100 003", "Lilongwe", ""),
            ("Civil Service United", "CIVO", Organization.Type.CLUB, "info@civilserviceunited.mw", "+265 999 100 004", "Lilongwe", ""),
            ("Karonga United", "Karonga", Organization.Type.CLUB, "info@karongaunited.mw", "+265 999 100 005", "Karonga", ""),
            ("Moyale Barracks", "Moyale", Organization.Type.CLUB, "info@moyalebarracks.mw", "+265 999 100 006", "Mzuzu", ""),
        ]
        organizations = {}
        for name, short_name, org_type, email, phone, address, website in rows:
            org, _ = Organization.objects.update_or_create(
                name=name,
                defaults={
                    "short_name": short_name,
                    "organization_type": org_type,
                    "email": email,
                    "phone": phone,
                    "address": address,
                    "website": website,
                    "status": "ACTIVE",
                },
            )
            organizations[short_name] = org
        return organizations

    def seed_stadiums(self, organizations):
        rows = [
            ("Bingu National Stadium", "Lilongwe", "Lilongwe", 41000, 12, "FAM"),
            ("Kamuzu Stadium", "Blantyre", "Blantyre", 40000, 10, "FAM"),
            ("Silver Stadium", "Lilongwe", "Lilongwe", 20000, 6, "Silver"),
            ("CIVO Stadium", "Lilongwe", "Lilongwe", 25000, 8, "CIVO"),
            ("Balaka Stadium", "Balaka", "Balaka", 12000, 4, "FAM"),
        ]
        stadiums = {}
        for name, city, district, capacity, gates, owner_key in rows:
            stadium, _ = Stadium.objects.update_or_create(
                name=name,
                defaults={
                    "city": city,
                    "district": district,
                    "capacity": capacity,
                    "number_of_gates": gates,
                    "owner": organizations.get(owner_key),
                },
            )
            stadiums[name] = stadium
        return stadiums

    def seed_clubs(self, organizations, stadiums):
        rows = [
            ("Bullets", "Blantyre", 1967, "Kamuzu Stadium", "Kalisto Pasuwa"),
            ("Wanderers", "Blantyre", 1962, "Kamuzu Stadium", "Bob Mpinganjira"),
            ("Silver", "Lilongwe", 1977, "Silver Stadium", "Peter Mponda"),
            ("CIVO", "Lilongwe", 1975, "CIVO Stadium", "Elia Kananji"),
            ("Karonga", "Karonga", 2008, "Bingu National Stadium", "Christopher Nyambose"),
            ("Moyale", "Mzuzu", 1971, "Bingu National Stadium", "Charles Kamanga"),
        ]
        clubs = {}
        for org_key, city, founded, stadium_name, coach in rows:
            club, _ = Club.objects.update_or_create(
                organization=organizations[org_key],
                defaults={
                    "short_name": organizations[org_key].short_name,
                    "city": city,
                    "founded_year": founded,
                    "stadium": stadiums[stadium_name],
                    "coach": coach,
                    "status": "ACTIVE",
                },
            )
            clubs[org_key] = club
        return clubs

    def seed_users(self, organizations):
        rows = [
            ("fam.admin", "fam.admin@mfetms.mw", UserProfile.Role.SUPER_ADMIN, "FAM"),
            ("sulom.admin", "sulom.admin@mfetms.mw", UserProfile.Role.SULOM_ADMIN, "SULOM"),
            ("bullets.admin", "bullets.admin@mfetms.mw", UserProfile.Role.CLUB_ADMIN, "Bullets"),
            ("gate.officer", "gate.officer@mfetms.mw", UserProfile.Role.TICKET_OFFICER, "SULOM"),
            ("supporter", "supporter@mfetms.mw", UserProfile.Role.SUPPORTER, None),
        ]
        users = {}
        for username, email, role, org_key in rows:
            user, created = User.objects.get_or_create(username=username, defaults={"email": email, "first_name": username.split(".")[0].title()})
            if created:
                user.set_password("Password123!")
            user.email = email
            user.is_staff = role in [UserProfile.Role.SUPER_ADMIN, UserProfile.Role.SULOM_ADMIN]
            user.is_superuser = role == UserProfile.Role.SUPER_ADMIN
            user.save()
            profile, _ = UserProfile.objects.update_or_create(
                user=user,
                defaults={"role": role, "organization": organizations.get(org_key), "phone": "+265 888 000 000", "status": "ACTIVE"},
            )
            group = Group.objects.get(name=dict(UserProfile.Role.choices)[role])
            user.groups.add(group)
            users[username] = user
        return users

    def seed_competitions(self, organizations):
        rows = [
            ("TNM Super League", "SULOM", "2026", Competition.Type.LEAGUE, date(2026, 4, 6), date(2026, 12, 20)),
            ("FDH Bank Cup", "FAM", "2026", Competition.Type.CUP, date(2026, 6, 1), date(2026, 10, 30)),
            ("Airtel Top 8", "FAM", "2026", Competition.Type.CUP, date(2026, 8, 1), date(2026, 11, 15)),
            ("Castel Challenge Cup", "FAM", "2026", Competition.Type.CUP, date(2026, 9, 1), date(2026, 12, 15)),
            ("FAM Women's League", "FAM", "2026", Competition.Type.WOMENS_LEAGUE, date(2026, 5, 1), date(2026, 11, 30)),
            ("National Division League", "FAM", "2026", Competition.Type.DIVISION, date(2026, 4, 15), date(2026, 12, 10)),
        ]
        competitions = {}
        for name, organizer_key, season, comp_type, start, end in rows:
            competition, _ = Competition.objects.update_or_create(
                name=name,
                season=season,
                defaults={
                    "organizer": organizations[organizer_key],
                    "competition_type": comp_type,
                    "start_date": start,
                    "end_date": end,
                    "status": "ACTIVE",
                },
            )
            competitions[name] = competition
        return competitions

    def seed_matches(self, competitions, clubs, stadiums, users):
        rows = [
            ("TNM Super League", "Bullets", "Wanderers", "Kamuzu Stadium", 12, date(2026, 7, 5), time(14, 30), Match.Status.SCHEDULED),
            ("TNM Super League", "Silver", "CIVO", "Bingu National Stadium", 12, date(2026, 7, 6), time(15, 0), Match.Status.SCHEDULED),
            ("FDH Bank Cup", "Karonga", "Moyale", "Balaka Stadium", 1, date(2026, 7, 12), time(14, 30), Match.Status.SCHEDULED),
            ("Airtel Top 8", "Wanderers", "Silver", "Kamuzu Stadium", 1, date(2026, 8, 9), time(14, 30), Match.Status.SCHEDULED),
        ]
        matches = {}
        for comp, home, away, stadium, match_day, match_date, kickoff, status in rows:
            match, _ = Match.objects.update_or_create(
                competition=competitions[comp],
                home_team=clubs[home],
                away_team=clubs[away],
                defaults={
                    "stadium": stadiums[stadium],
                    "match_day": match_day,
                    "date": match_date,
                    "kickoff_time": kickoff,
                    "status": status,
                    "created_by": users["sulom.admin"],
                },
            )
            matches[f"{home}-{away}"] = match
        return matches

    def seed_ticket_categories(self):
        rows = [
            ("Regular", "General open-stand access."),
            ("VIP", "Reserved premium seating."),
            ("Corporate", "Corporate hospitality seating."),
            ("VVIP", "Executive lounge and protocol seating."),
        ]
        categories = {}
        for name, description in rows:
            category, _ = TicketCategory.objects.update_or_create(name=name, defaults={"description": description})
            categories[name] = category
        return categories

    def seed_ticket_prices(self, matches, categories):
        prices = {"Regular": Decimal("3000"), "VIP": Decimal("10000"), "Corporate": Decimal("25000"), "VVIP": Decimal("50000")}
        quantities = {"Regular": 5000, "VIP": 600, "Corporate": 150, "VVIP": 80}
        for match in matches.values():
            for name, category in categories.items():
                MatchTicketPrice.objects.update_or_create(
                    match=match,
                    ticket_category=category,
                    defaults={"price": prices[name], "quantity": quantities[name], "available_quantity": quantities[name]},
                )

    def seed_tickets(self, matches, categories, users):
        sample_match = matches["Bullets-Wanderers"]
        supporter = users["supporter"]
        paid_ticket, _ = Ticket.objects.update_or_create(
            user=supporter,
            match=sample_match,
            category=categories["Regular"],
            seat_number="REG-001",
            defaults={"purchase_price": Decimal("3000"), "status": Ticket.Status.PAID},
        )
        vip_ticket, _ = Ticket.objects.update_or_create(
            user=supporter,
            match=sample_match,
            category=categories["VIP"],
            seat_number="VIP-014",
            defaults={"purchase_price": Decimal("10000"), "status": Ticket.Status.PAID},
        )
        return [paid_ticket, vip_ticket]

    def seed_revenue(self, tickets, matches):
        RevenueShareRule.objects.update_or_create(
            name="Default gate collection sharing",
            defaults={
                "fam_percentage": Decimal("5"),
                "sulom_percentage": Decimal("10"),
                "home_team_percentage": Decimal("45"),
                "away_team_percentage": Decimal("30"),
                "stadium_percentage": Decimal("5"),
                "security_percentage": Decimal("5"),
                "active": True,
            },
        )
        for ticket in tickets:
            Payment.objects.update_or_create(
                ticket=ticket,
                defaults={
                    "amount": ticket.purchase_price,
                    "provider": Payment.Provider.TNM_MPAMBA if ticket.category.name == "Regular" else Payment.Provider.AIRTEL_MONEY,
                    "transaction_reference": f"SEED-{ticket.ticket_number}",
                    "status": Payment.Status.SUCCESSFUL,
                },
            )
        total = sum((ticket.purchase_price for ticket in tickets), Decimal("0"))
        match = matches["Bullets-Wanderers"]
        RevenueDistribution.objects.update_or_create(
            match=match,
            defaults={
                "total_revenue": total,
                "fam_share": total * Decimal("0.05"),
                "sulom_share": total * Decimal("0.10"),
                "home_team_share": total * Decimal("0.45"),
                "away_team_share": total * Decimal("0.30"),
                "stadium_share": total * Decimal("0.05"),
                "security_share": total * Decimal("0.05"),
            },
        )

    def seed_verification(self, tickets, users):
        ticket = tickets[0]
        VerificationLog.objects.get_or_create(
            ticket=ticket,
            verified_by=users["gate.officer"],
            gate_number=1,
            status=VerificationLog.Status.VALID,
        )
