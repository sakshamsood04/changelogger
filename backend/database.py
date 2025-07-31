from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
from datetime import datetime
import os

# Database setup
DATABASE_URL = "sqlite:///./changelog.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Changelog(Base):
    __tablename__ = "changelogs"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=func.now())
    content = Column(Text, nullable=False)
    author = Column(String, nullable=False)
    repository = Column(String, nullable=False)  # owner/repo format
    commit_range = Column(String, nullable=False)  # e.g., "since: 2024-01-01"
    raw_commits = Column(JSON, nullable=True)  # Store commit data for traceability
    published = Column(Boolean, default=False)
    title = Column(String, nullable=True)

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()