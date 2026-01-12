"""
Database configuration and session management.

Supports SQLite (development) and PostgreSQL (production) with connection pooling.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Read from DATABASE_URL env var, fallback to SQLite for local dev
DATABASE_URL = os.environ.get("QUANTA_DATABASE_URL", "sqlite:///./quanta.db")

# Configure engine based on database type
if DATABASE_URL.startswith("sqlite"):
    # SQLite: single-threaded, no pooling needed
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
    )
else:
    # PostgreSQL: connection pooling for production
    engine = create_engine(
        DATABASE_URL,
        pool_size=20,           # Persistent connections
        max_overflow=40,        # Extra connections when pool exhausted
        pool_pre_ping=True,     # Test connections before use (handles stale)
        pool_recycle=600,       # Recycle connections after 10 min
        pool_timeout=30,        # Wait max 30s for a connection
        echo=False,
    )

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()


def get_db():
    """
    Dependency for routes - yields a DB session and closes it after use.

    Usage:
        @router.get("/items")
        def get_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    Called on application startup.
    """
    from app.db import models  # noqa: F401 - Import to register models
    Base.metadata.create_all(bind=engine)
    print("Database tables created")
