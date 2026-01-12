"""
QUANTA - Quantum Computing Research & Education Platform
FastAPI Backend Application

Priority Order (per CLAUDE.md):
1. Legal Protection
2. Science
3. Cost-Efficiency
4. Functionality
5. User-Friendliness
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import simulation, circuits, curriculum, health, auth, orgs, collab, experiments, payments, admin
from app.config import settings
from app.db.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print(f"Starting QUANTA Backend v{settings.version}")
    print(f"Environment: {settings.environment}")
    print(f"Max qubits: {settings.max_qubits}")

    if settings.axion_org_id > 0:
        print(f"Axion Org ID: {settings.axion_org_id} (unlimited access)")
    else:
        print("Axion Org ID: NOT SET (no unlimited access)")

    init_db()
    yield

    # Shutdown
    print("Shutting down QUANTA Backend")


app = FastAPI(
    title="QUANTA API",
    description="Quantum Computing Research & Education Platform - Simulation & Curriculum API",
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
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(orgs.router, prefix="/api", tags=["Organizations"])
app.include_router(simulation.router, prefix="/api", tags=["Simulation"])
app.include_router(circuits.router, prefix="/api", tags=["Circuits"])
app.include_router(curriculum.router, prefix="/api", tags=["Curriculum"])
app.include_router(collab.router, prefix="/api", tags=["Collaboration"])
app.include_router(experiments.router, prefix="/api", tags=["Research/DRIFT"])
app.include_router(payments.router, prefix="/api", tags=["Payments"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])

# Note: AI Tutor router removed per design decision (no AI features)


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "QUANTA API",
        "version": settings.version,
        "description": "Quantum Computing Research & Education Platform",
        "planes": {
            "education": "QUANTA - Educational SaaS for institutions",
            "research": "DRIFT - Degradation Regimes In Iterated Field Transformations"
        },
        "docs": "/docs",
    }
