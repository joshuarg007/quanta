"""
Pytest fixtures for QUANTA tests.

Sets up test database and common fixtures.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db
from app.db.models import Organization, User
from app.core.security import get_password_hash

# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def db_engine():
    """Create a test database engine."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create a test database session."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = TestingSessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_org(db_session):
    """Create a test organization."""
    org = Organization(
        name="Test Organization",
        domain="test.example.com",
        plan="free",
        simulation_runs_limit=100,
        circuits_limit=10,
        storage_bytes_limit=52428800,
        experiments_limit=0,
        experiment_runs_limit=0,
    )
    db_session.add(org)
    db_session.commit()
    db_session.refresh(org)
    return org


@pytest.fixture
def test_user(db_session, test_org):
    """Create a test user (owner, approved)."""
    user = User(
        email="owner@test.example.com",
        hashed_password=get_password_hash("testpassword123"),
        name="Test Owner",
        organization_id=test_org.id,
        role="OWNER",
        is_approved=True,
        email_verified=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_student(db_session, test_org):
    """Create a test student user (pending approval)."""
    user = User(
        email="student@test.example.com",
        hashed_password=get_password_hash("studentpass123"),
        name="Test Student",
        organization_id=test_org.id,
        role="STUDENT",
        is_approved=False,
        email_verified=False,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def axion_org(db_session):
    """Create an Axion Deep Labs organization (research plan)."""
    org = Organization(
        name="Axion Deep Labs",
        domain="axiondeep.com",
        plan="research",
        simulation_runs_limit=-1,  # Unlimited
        circuits_limit=-1,
        storage_bytes_limit=-1,
        experiments_limit=-1,
        experiment_runs_limit=-1,
    )
    db_session.add(org)
    db_session.commit()
    db_session.refresh(org)
    return org


@pytest.fixture
def axion_user(db_session, axion_org):
    """Create an Axion researcher user."""
    user = User(
        email="researcher@axiondeep.com",
        hashed_password=get_password_hash("researchpass123"),
        name="Test Researcher",
        organization_id=axion_org.id,
        role="RESEARCHER",
        is_approved=True,
        email_verified=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for test user."""
    response = client.post(
        "/api/auth/login",
        data={"username": test_user.email, "password": "testpassword123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def axion_auth_headers(client, axion_user):
    """Get authentication headers for Axion user."""
    response = client.post(
        "/api/auth/login",
        data={"username": axion_user.email, "password": "researchpass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
