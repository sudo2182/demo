"""
Database connection and session management.
Uses SQLAlchemy async engine for PostgreSQL.
"""

import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models import Base

logger = logging.getLogger(__name__)

# ── Database configuration ───────────────────────────────────────
# Fall back to SQLite for easy local development (vulnerable to local file access)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./admin_dashboard.db"
)

# Simple local engine configuration (insecure for production, perfect for demo)
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        echo=False,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create all tables in the database."""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_health() -> dict:
    """Run a quick health check against the database."""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"database": "healthy", "url": DATABASE_URL}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {"database": "unhealthy", "error": str(e)}
