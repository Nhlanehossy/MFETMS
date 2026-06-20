from ticket_categories.models import MatchTicketPrice

from .models import Ticket


def release_ticket_inventory(ticket):
    if ticket.status not in [Ticket.Status.PENDING, Ticket.Status.CANCELLED]:
        return
    price = MatchTicketPrice.objects.select_for_update().filter(
        match=ticket.match,
        ticket_category=ticket.category,
    ).first()
    if price and price.available_quantity < price.quantity:
        price.available_quantity += 1
        price.save(update_fields=["available_quantity"])
