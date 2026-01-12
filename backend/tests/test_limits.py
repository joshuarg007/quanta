"""
Tests for cost control and limit enforcement.

Priority: Cost-Efficiency - Preventing ridiculous costs is hardwired.
"""
import pytest
from app.core.plans import (
    check_simulation_limit,
    check_circuit_limit,
    check_experiment_limit,
    check_experiment_run_limit,
    LimitExceededError,
    increment_simulation_count,
    increment_circuit_count,
)


class TestLimitChecking:
    """Tests for limit checking functions."""

    def test_simulation_limit_within_limit(self, test_org):
        """Test simulation check passes when within limit."""
        test_org.simulation_runs_this_month = 50
        test_org.simulation_runs_limit = 100
        # Should not raise
        check_simulation_limit(test_org)

    def test_simulation_limit_exceeded(self, test_org):
        """Test simulation check fails when at limit."""
        test_org.simulation_runs_this_month = 100
        test_org.simulation_runs_limit = 100
        with pytest.raises(LimitExceededError) as exc_info:
            check_simulation_limit(test_org)
        assert exc_info.value.limit_type == "simulation_runs"

    def test_simulation_limit_unlimited(self, axion_org):
        """Test unlimited simulation passes (-1)."""
        axion_org.simulation_runs_this_month = 999999
        axion_org.simulation_runs_limit = -1
        # Should not raise
        check_simulation_limit(axion_org)

    def test_circuit_limit_exceeded(self, test_org):
        """Test circuit check fails when at limit."""
        test_org.circuits_count = 10
        test_org.circuits_limit = 10
        with pytest.raises(LimitExceededError) as exc_info:
            check_circuit_limit(test_org)
        assert exc_info.value.limit_type == "circuits"

    def test_experiment_limit_disabled(self, test_org):
        """Test experiment check fails when disabled (limit=0)."""
        test_org.experiments_limit = 0
        with pytest.raises(LimitExceededError) as exc_info:
            check_experiment_limit(test_org)
        assert "not available" in exc_info.value.message

    def test_experiment_limit_research_org(self, axion_org):
        """Test experiment check passes for research org."""
        axion_org.experiments_count = 100
        axion_org.experiments_limit = -1
        # Should not raise
        check_experiment_limit(axion_org)


class TestLimitIncrement:
    """Tests for usage increment functions."""

    def test_increment_simulation_count(self, db_session, test_org):
        """Test incrementing simulation count."""
        initial = test_org.simulation_runs_this_month
        increment_simulation_count(db_session, test_org)
        assert test_org.simulation_runs_this_month == initial + 1

    def test_increment_circuit_count(self, db_session, test_org):
        """Test incrementing circuit count."""
        initial = test_org.circuits_count
        increment_circuit_count(db_session, test_org)
        assert test_org.circuits_count == initial + 1


class TestAPILimitEnforcement:
    """Tests for limit enforcement at API level."""

    def test_simulation_returns_429_at_limit(self, client, auth_headers, test_org, db_session):
        """Test simulation endpoint returns 429 when limit reached."""
        # Set org to be at limit
        test_org.simulation_runs_this_month = test_org.simulation_runs_limit
        db_session.commit()

        response = client.post(
            "/api/simulate",
            json={
                "circuit": {
                    "id": "test",
                    "name": "Test",
                    "numQubits": 2,
                    "gates": [],
                },
                "shots": 100,
            },
            headers=auth_headers,
        )
        assert response.status_code == 429
        assert "limit" in response.json()["detail"].lower()

    def test_circuit_create_returns_429_at_limit(self, client, auth_headers, test_org, db_session):
        """Test circuit creation returns 429 when limit reached."""
        # Set org to be at limit
        test_org.circuits_count = test_org.circuits_limit
        db_session.commit()

        response = client.post(
            "/api/circuits",
            json={
                "name": "Test Circuit",
                "numQubits": 2,
                "gates": [],
            },
            headers=auth_headers,
        )
        assert response.status_code == 429


class TestAxionUnlimited:
    """Tests for Axion Deep Labs unlimited access."""

    def test_axion_simulation_no_limit(self, client, axion_auth_headers, axion_org, db_session):
        """Test Axion org can run simulations without limit."""
        # Even with high count, should succeed
        axion_org.simulation_runs_this_month = 999999
        db_session.commit()

        response = client.post(
            "/api/simulate",
            json={
                "circuit": {
                    "id": "test",
                    "name": "Test",
                    "numQubits": 2,
                    "gates": [],
                },
                "shots": 100,
            },
            headers=axion_auth_headers,
        )
        # Should succeed (200) not be blocked (429)
        assert response.status_code == 200
