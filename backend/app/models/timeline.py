from sqlalchemy import Column, String, DateTime, JSON, Float, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Timeline(Base):
    __tablename__ = "timelines"

    id = Column(String, primary_key=True, default=generate_uuid)
    topic = Column(String, nullable=False)
    query = Column(String, nullable=False)
    status = Column(String, default="processing")  # processing, completed, failed
    progress = Column(String, default="0/0")
    date_range_start = Column(DateTime, nullable=True)
    date_range_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    events = relationship("Event", back_populates="timeline", cascade="all, delete-orphan")


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=generate_uuid)
    timeline_id = Column(String, ForeignKey("timelines.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(DateTime, nullable=False)
    priority = Column(String, default="medium")  # critical, high, medium, low
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    timeline = relationship("Timeline", back_populates="events")
    branches = relationship("Branch", back_populates="event", cascade="all, delete-orphan")
    sources = relationship("Source", back_populates="event", cascade="all, delete-orphan")


class Branch(Base):
    __tablename__ = "branches"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    narrative = Column(Text, nullable=False)
    credibility_score = Column(Float, default=0.5)
    evidence = Column(Text, nullable=True)
    source_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    event = relationship("Event", back_populates="branches")
    sources = relationship("Source", back_populates="branch", cascade="all, delete-orphan")


class Source(Base):
    __tablename__ = "sources"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    branch_id = Column(String, ForeignKey("branches.id"), nullable=True)
    url = Column(String, nullable=False)
    outlet = Column(String, nullable=False)
    credibility_score = Column(Float, default=0.5)
    publish_date = Column(DateTime, nullable=True)
    claims = Column(JSON, default=list)  # List of claim strings
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    event = relationship("Event", back_populates="sources")
    branch = relationship("Branch", back_populates="sources")
