"""
Tests for authentication API endpoints.
"""
import pytest


class TestLogin:
    """Tests for login endpoint."""

    def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post(
            "/api/auth/login",
            data={"username": test_user.email, "password": "testpassword123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == test_user.email
        assert data["user"]["role"] == "OWNER"

    def test_login_wrong_password(self, client, test_user):
        """Test login with wrong password."""
        response = client.post(
            "/api/auth/login",
            data={"username": test_user.email, "password": "wrongpassword"},
        )
        assert response.status_code == 401
        assert "Incorrect" in response.json()["detail"]

    def test_login_unknown_user(self, client):
        """Test login with unknown email."""
        response = client.post(
            "/api/auth/login",
            data={"username": "unknown@example.com", "password": "password123"},
        )
        assert response.status_code == 401

    def test_login_sets_cookies(self, client, test_user):
        """Test that login sets HTTP-only cookies."""
        response = client.post(
            "/api/auth/login",
            data={"username": test_user.email, "password": "testpassword123"},
        )
        assert response.status_code == 200
        # Check cookies are set
        assert "access_token" in response.cookies or "access_token" in str(response.headers)


class TestMe:
    """Tests for /me endpoint."""

    def test_me_authenticated(self, client, auth_headers, test_user):
        """Test getting current user info."""
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == test_user.email
        assert "usage" in data
        assert "simulation_runs" in data["usage"]

    def test_me_unauthenticated(self, client):
        """Test /me without authentication."""
        response = client.get("/api/auth/me")
        assert response.status_code == 401


class TestLogout:
    """Tests for logout endpoint."""

    def test_logout(self, client, auth_headers):
        """Test logout clears session."""
        response = client.post("/api/auth/logout", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["ok"] is True


class TestAccountLockout:
    """Tests for account lockout after failed attempts."""

    def test_lockout_after_failed_attempts(self, client, test_user):
        """Test account gets locked after too many failed attempts."""
        # Make multiple failed login attempts
        for _ in range(5):
            client.post(
                "/api/auth/login",
                data={"username": test_user.email, "password": "wrongpassword"},
            )

        # Next attempt should be locked
        response = client.post(
            "/api/auth/login",
            data={"username": test_user.email, "password": "testpassword123"},
        )
        # Should be locked (423) or still 401 depending on implementation
        assert response.status_code in [401, 423]
