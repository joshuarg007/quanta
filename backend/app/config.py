"""
QUANTA Backend Configuration
"""
from pydantic_settings import BaseSettings
from typing import List


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

    # Database (future)
    database_url: str = "postgresql+asyncpg://quanta:quanta@localhost:5432/quanta"

    class Config:
        env_file = ".env"
        env_prefix = "QUANTA_"


settings = Settings()
