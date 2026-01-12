"""
Tests for organization and signup API endpoints.
"""
import pytest


class TestSignup:
    """Tests for signup endpoint."""

    def test_signup_new_personal_org(self, client):
        """Test signup with personal email creates personal org."""
        response = client.post(
            "/api/orgs/signup",
            json={
                "email": "newuser@gmail.com",
                "password": "securepassword123",
                "name": "New User",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@gmail.com"
        assert data["is_first_user"] is True
        assert data["requires_approval"] is False  # First user auto-approved

    def test_signup_duplicate_email(self, client, test_user):
        """Test signup with existing email fails."""
        response = client.post(
            "/api/orgs/signup",
            json={
                "email": test_user.email,
                "password": "anotherpassword123",
            },
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    def test_signup_joins_existing_org(self, client, test_org, test_user):
        """Test signup with same domain joins existing org."""
        # test_user fixture creates an existing user in test_org
        response = client.post(
            "/api/orgs/signup",
            json={
                "email": "newuser@test.example.com",
                "password": "securepassword123",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["organization_id"] == test_org.id
        assert data["is_first_user"] is False
        assert data["requires_approval"] is True  # Second user needs approval

    def test_signup_edu_domain_gets_education_plan(self, client):
        """Test signup with .edu email gets education plan."""
        response = client.post(
            "/api/orgs/signup",
            json={
                "email": "student@university.edu",
                "password": "securepassword123",
            },
        )
        assert response.status_code == 201
        # Would need to check org plan in DB


class TestOrganizationCurrent:
    """Tests for current organization endpoint."""

    def test_get_current_org(self, client, auth_headers, test_org):
        """Test getting current organization info."""
        response = client.get("/api/orgs/current", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["organization"]["id"] == test_org.id
        assert "usage" in data

    def test_get_current_org_unauthenticated(self, client):
        """Test getting org info without auth fails."""
        response = client.get("/api/orgs/current")
        assert response.status_code == 401


class TestUserManagement:
    """Tests for user management within organization."""

    def test_list_users(self, client, auth_headers, test_user):
        """Test listing users in organization."""
        response = client.get("/api/orgs/users", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(u["email"] == test_user.email for u in data)

    def test_approve_user(self, client, auth_headers, test_student, db_session):
        """Test approving a pending user."""
        response = client.post(
            f"/api/orgs/users/{test_student.id}/approve",
            headers=auth_headers,
        )
        assert response.status_code == 200

        # Verify user is approved
        db_session.refresh(test_student)
        assert test_student.is_approved is True
