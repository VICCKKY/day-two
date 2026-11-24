"""Fictional demo leads. Names and numbers are made up; no real buyer data."""
import logging
from datetime import date, timedelta

from app.database import Base, SessionLocal, engine
from app.models import Lead, utcnow

log = logging.getLogger(__name__)

DEMO = [
    ("Cold-pressed groundnut oil", "Edible oil", "500 litres / month", "Madurai", "distributor", "₹1.2–1.4 lakh / month", 20, "Wants 1L and 5L cans; supplies 40 shops."),
    ("Handloom cotton towels", "Textiles", "2,000 pcs", "Chennai", "wholesaler", "₹60–80 per pc", 30, "Repeat order every quarter if quality holds."),
    ("Masala powder packets (50g)", "Food products", "10,000 packets", "Coimbatore", "distributor", "₹7–9 per packet", 15, "Needs FSSAI licence copy before first order."),
    ("Cow-dung idols & decor", "Home decor", "300 pcs", "Tiruchirappalli", "shop", "₹150–400 per pc", 45, "Pooja store chain, 3 outlets."),
    ("Coir door mats", "Home decor", "1,500 pcs", "Salem", "wholesaler", "₹90–120 per pc", 25, "Prefers printed designs."),
    ("Millet snacks", "Food products", "800 kg", "Erode", "bulk_buyer", "₹1.5 lakh", 10, "Corporate canteen order; sample needed first."),
    ("Stainless steel lunch boxes", "Kitchenware", "1,200 pcs", "Tirunelveli", "distributor", "₹180–220 per pc", 35, "Covers 3 districts."),
    ("Herbal soap bars", "Personal care", "5,000 bars", "Coimbatore", "shop", "₹25–30 per bar", 20, "Supermarket, wants private label later."),
]


def run() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Lead).count():
            log.info("Leads already present; skipping seed")
            return
        now = utcnow()
        for i, (product, cat, qty, city, btype, budget, days, notes) in enumerate(DEMO):
            db.add(Lead(
                product=product, category=cat, quantity=qty, city=city, buyer_type=btype, budget=budget,
                needed_by=date.today() + timedelta(days=days), notes=notes,
                buyer_name=f"Demo Buyer {i + 1} Traders", buyer_phone=f"90000000{i + 10:02d}",
                verified_at=now - timedelta(hours=6 * i), consent_at=now - timedelta(hours=6 * i),
                consent_source="Demo data (fictional)",
            ))
        db.commit()
        log.info("Seeded %d demo leads", len(DEMO))
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run()
