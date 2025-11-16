"""Script to seed the database with initial data"""

import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from care_cartography_api.database import Base, SessionLocal, engine
from care_cartography_api.models import Institution


def seed_database():
    """Seed the database with initial institution data"""
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Create a database session
    db = SessionLocal()

    try:
        # Check if institutions already exist
        existing = db.query(Institution).first()
        if existing:
            print("Database already has data. Skipping seed.")
            return

        # Create initial institution
        institution = Institution(
            id="2cd7ac3421634b128f4b2e274991021d",
            name="Æblerød Plejehjem",
            qr_code_svg="<svg>...</svg>",
        )

        db.add(institution)
        db.commit()

        print("Database seeded successfully!")
        print(f"Created institution: {institution.name} (ID: {institution.id})")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
