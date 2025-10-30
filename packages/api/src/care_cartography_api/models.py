from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from enum import StrEnum
from datetime import datetime
from .database import Base

class InstitutionStatus(StrEnum):
    INACTIVE = "inactive"
    ACTIVE = "active"
    PAUSED = "paused"

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default=InstitutionStatus.INACTIVE.value, nullable=False)
    qr_code_svg = Column(String, nullable=False)

    # Relationship to ratings
    ratings = relationship("Rating", back_populates="institution", cascade="all, delete-orphan")


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    institution_id = Column(String, ForeignKey("institutions.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to institution
    institution = relationship("Institution", back_populates="ratings")
