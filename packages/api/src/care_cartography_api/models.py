from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    qr_code_svg = Column(String, nullable=False)
    activation_date = Column(DateTime, nullable=False)
    deactivation_date = Column(DateTime, nullable=False)
    paused = Column(Boolean, nullable=False, default=False)

    # Relationship to ratings
    ratings = relationship(
        "Rating", back_populates="institution", cascade="all, delete-orphan"
    )

    @property
    def status(self) -> str:
        """Compute institution status based on dates and paused state"""
        if self.paused:
            return "paused"

        now = datetime.utcnow()
        if self.activation_date <= now <= self.deactivation_date:
            return "active"
        elif now < self.activation_date:
            return "pending"
        else:
            return "expired"


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    institution_id = Column(String, ForeignKey("institutions.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to institution
    institution = relationship("Institution", back_populates="ratings")
