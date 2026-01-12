"""Initial schema for QUANTA multi-tenant platform.

Revision ID: 001_initial
Revises:
Create Date: 2026-01-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # === ORGANIZATIONS ===
    op.create_table(
        'organizations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('domain', sa.String(255), nullable=False),
        sa.Column('api_key', sa.String(64), nullable=True),

        # Plan and billing
        sa.Column('plan', sa.String(50), nullable=False, server_default='free'),
        sa.Column('billing_cycle', sa.String(20), nullable=False, server_default='monthly'),
        sa.Column('subscription_status', sa.String(20), nullable=False, server_default='inactive'),

        # Stripe
        sa.Column('stripe_customer_id', sa.String(255), nullable=True),
        sa.Column('stripe_subscription_id', sa.String(255), nullable=True),
        sa.Column('current_period_end', sa.DateTime(), nullable=True),

        # Trial
        sa.Column('trial_started_at', sa.DateTime(), nullable=True),
        sa.Column('trial_ends_at', sa.DateTime(), nullable=True),

        # Usage tracking (Cost Control)
        sa.Column('simulation_runs_this_month', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('simulation_runs_limit', sa.Integer(), nullable=False, server_default='100'),
        sa.Column('circuits_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('circuits_limit', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('storage_bytes_used', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('storage_bytes_limit', sa.Integer(), nullable=False, server_default='52428800'),

        # DRIFT: Experiment limits
        sa.Column('experiments_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('experiments_limit', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('experiment_runs_this_month', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('experiment_runs_limit', sa.Integer(), nullable=False, server_default='0'),

        # Usage reset tracking
        sa.Column('usage_month_reset', sa.DateTime(), nullable=True),
        sa.Column('usage_alert_80_sent', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('usage_alert_100_sent', sa.Boolean(), nullable=False, server_default='0'),

        # Institution info
        sa.Column('institution_type', sa.String(50), nullable=True),

        # Branding
        sa.Column('logo_url', sa.String(512), nullable=True),
        sa.Column('primary_color', sa.String(7), nullable=True),

        # Onboarding
        sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default='0'),

        # Timestamps
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=True),

        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_organizations_id', 'organizations', ['id'])
    op.create_index('ix_organizations_domain', 'organizations', ['domain'], unique=True)
    op.create_index('ix_organizations_api_key', 'organizations', ['api_key'], unique=True)
    op.create_index('ix_organizations_stripe_customer_id', 'organizations', ['stripe_customer_id'])
    op.create_index('ix_organizations_stripe_subscription_id', 'organizations', ['stripe_subscription_id'])

    # === USERS ===
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=True),

        # Tenant
        sa.Column('organization_id', sa.Integer(), nullable=False),

        # Role
        sa.Column('role', sa.String(20), nullable=False, server_default='STUDENT'),

        # Approval
        sa.Column('is_approved', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('is_default', sa.Boolean(), nullable=False, server_default='0'),

        # Email verification
        sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('email_verification_token', sa.String(100), nullable=True),
        sa.Column('email_verification_sent_at', sa.DateTime(), nullable=True),

        # Security
        sa.Column('failed_login_attempts', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('locked_until', sa.DateTime(), nullable=True),
        sa.Column('last_login_at', sa.DateTime(), nullable=True),
        sa.Column('last_login_ip', sa.String(45), nullable=True),

        # Timestamps
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),

        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='RESTRICT'),
    )
    op.create_index('ix_users_id', 'users', ['id'])
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_organization_id', 'users', ['organization_id'])
    op.create_index('ix_users_email_verification_token', 'users', ['email_verification_token'])

    # === PROGRESS ===
    op.create_table(
        'progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('lesson_id', sa.String(100), nullable=False),
        sa.Column('current_section', sa.Integer(), server_default='0'),
        sa.Column('completed_sections', sa.JSON(), nullable=True),
        sa.Column('quiz_scores', sa.JSON(), nullable=True),
        sa.Column('completed', sa.Boolean(), server_default='0'),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('last_accessed_at', sa.DateTime(), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'lesson_id', name='uq_user_lesson'),
    )
    op.create_index('ix_progress_id', 'progress', ['id'])
    op.create_index('ix_progress_user_id', 'progress', ['user_id'])
    op.create_index('ix_progress_organization_id', 'progress', ['organization_id'])
    op.create_index('ix_progress_lesson_id', 'progress', ['lesson_id'])

    # === CIRCUITS ===
    op.create_table(
        'circuits',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('num_qubits', sa.Integer(), server_default='2'),
        sa.Column('gates', sa.JSON(), nullable=True),

        # Sharing
        sa.Column('is_public', sa.Boolean(), server_default='0'),
        sa.Column('is_org_shared', sa.Boolean(), server_default='0'),

        # Timestamps
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_circuits_id', 'circuits', ['id'])
    op.create_index('ix_circuits_user_id', 'circuits', ['user_id'])
    op.create_index('ix_circuits_organization_id', 'circuits', ['organization_id'])

    # === EXPERIMENTS (DRIFT) ===
    op.create_table(
        'experiments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('researcher_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('hypothesis', sa.Text(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('config', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='draft'),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('random_seed', sa.Integer(), nullable=True),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),

        # Timestamps
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['researcher_id'], ['users.id'], ondelete='SET NULL'),
    )
    op.create_index('ix_experiments_id', 'experiments', ['id'])
    op.create_index('ix_experiments_organization_id', 'experiments', ['organization_id'])
    op.create_index('ix_experiments_researcher_id', 'experiments', ['researcher_id'])

    # === EXPERIMENT RUNS (DRIFT) ===
    op.create_table(
        'experiment_runs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('experiment_id', sa.Integer(), nullable=False),
        sa.Column('parameters', sa.JSON(), nullable=True),
        sa.Column('initial_state', sa.JSON(), nullable=True),
        sa.Column('operator_sequence', sa.JSON(), nullable=True),
        sa.Column('results', sa.JSON(), nullable=True),
        sa.Column('final_state', sa.JSON(), nullable=True),
        sa.Column('iterations', sa.Integer(), nullable=True),
        sa.Column('execution_time_ms', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('executed_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),

        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['experiment_id'], ['experiments.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_experiment_runs_id', 'experiment_runs', ['id'])
    op.create_index('ix_experiment_runs_experiment_id', 'experiment_runs', ['experiment_id'])


def downgrade() -> None:
    op.drop_table('experiment_runs')
    op.drop_table('experiments')
    op.drop_table('circuits')
    op.drop_table('progress')
    op.drop_table('users')
    op.drop_table('organizations')
