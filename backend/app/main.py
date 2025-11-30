"""
QUANTA - Quantum Computing Learning Platform
FastAPI Backend Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import simulation, circuits, curriculum, health
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print(f"🚀 Starting QUANTA Backend v{settings.version}")
    print(f"📊 Max qubits: {settings.max_qubits}")
    yield
    # Shutdown
    print("👋 Shutting down QUANTA Backend")


app = FastAPI(
    title="QUANTA API",
    description="Quantum Computing Learning Platform - Simulation & Curriculum API",
    version=settings.version,
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(simulation.router, prefix="/api", tags=["Simulation"])
app.include_router(circuits.router, prefix="/api", tags=["Circuits"])
app.include_router(curriculum.router, prefix="/api", tags=["Curriculum"])


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "QUANTA API",
        "version": settings.version,
        "description": "Quantum Computing Learning Platform",
        "docs": "/docs",
    }
