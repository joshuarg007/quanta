// Dashboard page for QUANTA - Usage stats and quick actions
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import './Dashboard.css';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

interface UsageBarProps {
  label: string;
  current: number;
  limit: number | string;
  unit?: string;
  formatValue?: (v: number) => string;
}

function UsageBar({ label, current, limit, unit = '', formatValue }: UsageBarProps) {
  const isUnlimited = limit === 'unlimited' || limit === -1;
  const percent = isUnlimited ? 0 : Math.min(100, (current / (limit as number)) * 100);
  const displayCurrent = formatValue ? formatValue(current) : current;
  const displayLimit = isUnlimited ? 'Unlimited' : (formatValue ? formatValue(limit as number) : limit);

  return (
    <div className="usage-bar">
      <div className="usage-bar-header">
        <span className="usage-label">{label}</span>
        <span className="usage-value">
          {displayCurrent}{unit} / {displayLimit}{!isUnlimited && unit}
        </span>
      </div>
      <div className="usage-bar-track">
        <div
          className={`usage-bar-fill ${percent >= 90 ? 'critical' : percent >= 70 ? 'warning' : ''}`}
          style={{ width: isUnlimited ? '0%' : `${percent}%` }}
        />
      </div>
      {!isUnlimited && percent >= 80 && (
        <div className="usage-warning">
          {percent >= 100 ? 'Limit reached!' : 'Approaching limit'}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, usage } = useAuth();

  if (!user || !usage) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const planLabels: Record<string, string> = {
    free: 'Free Plan',
    education: 'Education Plan',
    research: 'Research Plan',
  };

  const roleLabels: Record<string, string> = {
    OWNER: 'Owner',
    ADMIN: 'Administrator',
    INSTRUCTOR: 'Instructor',
    STUDENT: 'Student',
    RESEARCHER: 'Researcher',
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back{user.name ? `, ${user.name}` : ''}!</h1>
          <p className="user-meta">
            {user.email} &middot; {roleLabels[user.role] || user.role}
            {user.organization.is_axion && (
              <span className="axion-badge">Axion Deep Labs</span>
            )}
          </p>
        </div>
        <div className="plan-badge-container">
          <span className={`plan-badge plan-${user.organization.plan}`}>
            {planLabels[user.organization.plan] || user.organization.plan}
          </span>
        </div>
      </div>

      {!user.is_approved && (
        <div className="approval-banner">
          <span className="approval-icon">&#x23F3;</span>
          <div>
            <strong>Account Pending Approval</strong>
            <p>Your organization administrator needs to approve your account for full access.</p>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Usage Stats */}
        <section className="dashboard-card usage-card">
          <h2>Usage This Month</h2>
          {usage.resets_at && (
            <p className="reset-date">
              Resets on {new Date(usage.resets_at).toLocaleDateString()}
            </p>
          )}

          <div className="usage-stats">
            <UsageBar
              label="Simulations"
              current={usage.simulation_runs.current}
              limit={usage.simulation_runs.limit}
            />
            <UsageBar
              label="Circuits"
              current={usage.circuits.current}
              limit={usage.circuits.limit}
            />
            <UsageBar
              label="Storage"
              current={usage.storage_bytes.current}
              limit={usage.storage_bytes.limit}
              formatValue={formatBytes}
            />
            {(usage.experiments.limit !== 0) && (
              <>
                <UsageBar
                  label="Experiments"
                  current={usage.experiments.current}
                  limit={usage.experiments.limit}
                />
                <UsageBar
                  label="Experiment Runs"
                  current={usage.experiment_runs.current}
                  limit={usage.experiment_runs.limit}
                />
              </>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="dashboard-card actions-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/sandbox" className="action-btn action-primary">
              <span className="action-icon">&#x25B6;</span>
              <span>Circuit Sandbox</span>
            </Link>
            <Link to="/learn" className="action-btn">
              <span className="action-icon">&#x1F4DA;</span>
              <span>Lessons</span>
            </Link>
            <Link to="/circuits" className="action-btn">
              <span className="action-icon">&#x1F4BE;</span>
              <span>My Circuits</span>
            </Link>
            {user.organization.is_axion && (
              <Link to="/experiments" className="action-btn action-research">
                <span className="action-icon">&#x1F52C;</span>
                <span>DRIFT Experiments</span>
              </Link>
            )}
          </div>
        </section>

        {/* Organization Info */}
        <section className="dashboard-card org-card">
          <h2>Organization</h2>
          <div className="org-info">
            <div className="org-detail">
              <span className="detail-label">Name</span>
              <span className="detail-value">{user.organization.name || 'Personal'}</span>
            </div>
            <div className="org-detail">
              <span className="detail-label">Plan</span>
              <span className="detail-value">{planLabels[user.organization.plan]}</span>
            </div>
            <div className="org-detail">
              <span className="detail-label">Your Role</span>
              <span className="detail-value">{roleLabels[user.role]}</span>
            </div>
          </div>
          {(user.role === 'OWNER' || user.role === 'ADMIN') && (
            <Link to="/settings/organization" className="org-settings-link">
              Manage Organization
            </Link>
          )}
        </section>

        {/* Account Status */}
        <section className="dashboard-card status-card">
          <h2>Account Status</h2>
          <div className="status-items">
            <div className={`status-item ${user.is_approved ? 'status-ok' : 'status-pending'}`}>
              <span className="status-icon">{user.is_approved ? '\u2713' : '\u23F3'}</span>
              <span>Account {user.is_approved ? 'Approved' : 'Pending'}</span>
            </div>
            <div className={`status-item ${user.email_verified ? 'status-ok' : 'status-warning'}`}>
              <span className="status-icon">{user.email_verified ? '\u2713' : '!'}</span>
              <span>Email {user.email_verified ? 'Verified' : 'Not Verified'}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
