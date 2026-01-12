"""
Email service for QUANTA.

Handles sending verification emails, notifications, etc.
Supports SMTP and can be extended for other providers (SendGrid, SES, etc.).
"""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import secrets
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.config import settings
from app.db.models import User

logger = logging.getLogger(__name__)


def generate_verification_token() -> str:
    """Generate a secure random token for email verification."""
    return secrets.token_urlsafe(32)


def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None,
) -> bool:
    """
    Send an email via SMTP.

    Returns True if successful, False otherwise.
    """
    if not settings.email_enabled:
        logger.info(f"Email disabled - would send to {to_email}: {subject}")
        return True

    if not settings.smtp_host or not settings.smtp_username:
        logger.warning("SMTP not configured, cannot send email")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.email_from_name} <{settings.email_from_address}>"
        msg["To"] = to_email

        # Attach text and HTML parts
        if text_body:
            msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        # Connect and send
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)

        logger.info(f"Email sent to {to_email}: {subject}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


def send_verification_email(user: User, db: Session) -> bool:
    """
    Send email verification to a user.

    Generates a new token and stores it in the database.
    """
    # Generate token
    token = generate_verification_token()
    user.email_verification_token = token
    user.email_verification_sent_at = datetime.utcnow()
    db.commit()

    # Build verification URL
    verify_url = f"{settings.frontend_base_url}/verify-email?token={token}"

    subject = "Verify your QUANTA email address"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 20px 0; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #6366f1; }}
            .button {{ display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            .footer {{ text-align: center; color: #888; font-size: 12px; margin-top: 40px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">&#x25C8; QUANTA</div>
            </div>

            <p>Hi{' ' + user.name if user.name else ''},</p>

            <p>Welcome to QUANTA! Please verify your email address to complete your registration.</p>

            <p style="text-align: center;">
                <a href="{verify_url}" class="button">Verify Email Address</a>
            </p>

            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6366f1;">{verify_url}</p>

            <p>This link will expire in 24 hours.</p>

            <p>If you didn't create a QUANTA account, you can safely ignore this email.</p>

            <div class="footer">
                <p>&copy; {datetime.now().year} Axion Deep Labs. All rights reserved.</p>
                <p>QUANTA - Quantum Computing Education Platform</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_body = f"""
    Welcome to QUANTA!

    Please verify your email address by clicking the link below:

    {verify_url}

    This link will expire in 24 hours.

    If you didn't create a QUANTA account, you can safely ignore this email.

    - The QUANTA Team
    """

    return send_email(user.email, subject, html_body, text_body)


def send_approval_notification(user: User) -> bool:
    """
    Notify user that their account has been approved.
    """
    subject = "Your QUANTA account has been approved!"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 20px 0; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #6366f1; }}
            .button {{ display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            .footer {{ text-align: center; color: #888; font-size: 12px; margin-top: 40px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">&#x25C8; QUANTA</div>
            </div>

            <p>Hi{' ' + user.name if user.name else ''},</p>

            <p>Great news! Your QUANTA account has been approved by your organization administrator.</p>

            <p>You now have full access to QUANTA's quantum computing learning platform.</p>

            <p style="text-align: center;">
                <a href="{settings.frontend_base_url}/login" class="button">Sign In to QUANTA</a>
            </p>

            <p>Start exploring:</p>
            <ul>
                <li>Build quantum circuits in the sandbox</li>
                <li>Learn through interactive lessons</li>
                <li>Track your progress</li>
            </ul>

            <div class="footer">
                <p>&copy; {datetime.now().year} Axion Deep Labs. All rights reserved.</p>
                <p>QUANTA - Quantum Computing Education Platform</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_body = f"""
    Hi{' ' + user.name if user.name else ''},

    Great news! Your QUANTA account has been approved by your organization administrator.

    You now have full access to QUANTA's quantum computing learning platform.

    Sign in at: {settings.frontend_base_url}/login

    - The QUANTA Team
    """

    return send_email(user.email, subject, html_body, text_body)


def send_usage_alert(user: User, limit_type: str, percent_used: int) -> bool:
    """
    Send usage limit warning to organization owner/admin.
    """
    subject = f"QUANTA Usage Alert: {percent_used}% of {limit_type.replace('_', ' ')} used"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 20px 0; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #6366f1; }}
            .alert {{ background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 20px 0; }}
            .button {{ display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            .footer {{ text-align: center; color: #888; font-size: 12px; margin-top: 40px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">&#x25C8; QUANTA</div>
            </div>

            <div class="alert">
                <strong>Usage Alert</strong>
                <p>Your organization has used {percent_used}% of its monthly {limit_type.replace('_', ' ')} limit.</p>
            </div>

            <p>Hi{' ' + user.name if user.name else ''},</p>

            <p>This is an automated alert to let you know your organization is approaching its usage limit.</p>

            <p>If you need additional capacity, you can purchase add-ons from your dashboard.</p>

            <p style="text-align: center;">
                <a href="{settings.frontend_base_url}/dashboard" class="button">View Usage</a>
            </p>

            <div class="footer">
                <p>&copy; {datetime.now().year} Axion Deep Labs. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    return send_email(user.email, subject, html_body)


def verify_email_token(token: str, db: Session) -> Optional[User]:
    """
    Verify an email verification token.

    Returns the user if valid, None otherwise.
    Also checks token expiration (24 hours).
    """
    user = db.query(User).filter(User.email_verification_token == token).first()

    if not user:
        return None

    # Check expiration (24 hours)
    if user.email_verification_sent_at:
        expiry = user.email_verification_sent_at + timedelta(hours=24)
        if datetime.utcnow() > expiry:
            logger.info(f"Email verification token expired for {user.email}")
            return None

    # Mark email as verified
    user.email_verified = True
    user.email_verification_token = None
    user.email_verification_sent_at = None
    db.commit()

    logger.info(f"Email verified for {user.email}")
    return user
