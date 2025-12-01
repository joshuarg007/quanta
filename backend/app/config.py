"""
QUANTA Backend Configuration
"""
from pydantic_settings import BaseSettings
from typing import List
import secrets


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # Application
    version: str = "0.1.0"
    debug: bool = True

    # Quantum Simulation
    max_qubits: int = 16
    default_shots: int = 1024

    # CORS
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
    ]

    # Database - SQLite for development
    database_url: str = "sqlite:///./quanta.db"

    # JWT Authentication
    secret_key: str = secrets.token_urlsafe(32)  # Override in production!
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Account limits
    free_circuits_limit: int = 3
    pro_circuits_limit: int = 1000

    class Config:
        env_file = ".env"
        env_prefix = "QUANTA_"


settings = Settings()
