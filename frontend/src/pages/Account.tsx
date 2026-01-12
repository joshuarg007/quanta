// Account page with profile management
import { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import './Account.css';

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const getInitials = () => {
    if (!user?.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  const accountTypeLabel = () => {
    switch (user?.organization?.plan) {
      case 'education':
        return 'Education';
      case 'research':
        return 'Research';
      default:
        return 'Free';
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { level: 0, label: '' };
    if (password.length < 8) return { level: 1, label: 'Weak' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: 'Weak' };
    if (score <= 3) return { level: 2, label: 'Fair' };
    if (score <= 4) return { level: 3, label: 'Good' };
    return { level: 4, label: 'Strong' };
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.new.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setPasswordSuccess(true);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setIsChangingPassword(false);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await logout();
    navigate('/');
  };

  const strength = getPasswordStrength(passwordForm.new);

  return (
    <div className="account-page">
      <div className="account-header">
        <h1>Account</h1>
        <p>Manage your profile and security settings</p>
      </div>

      <div className="account-grid">
        {/* Profile Section */}
        <section className="account-section profile-section">
          <h2>Profile</h2>
          <div className="profile-card">
            <div className="profile-avatar">
              {getInitials()}
            </div>
            <div className="profile-info">
              <span className="profile-email">{user?.email}</span>
              <span className="profile-plan">{accountTypeLabel()}</span>
              {user?.organization?.name && (
                <span className="profile-org">{user.organization.name}</span>
              )}
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Account Type</span>
              <span className="detail-value">{accountTypeLabel()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Role</span>
              <span className="detail-value">{user?.role || 'User'}</span>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="account-section security-section">
          <h2>Security</h2>
          <h3>Change Password</h3>

          {passwordSuccess && (
            <div className="success-message">
              Password changed successfully!
            </div>
          )}

          {passwordError && (
            <div className="error-message">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input
                type="password"
                id="current-password"
                value={passwordForm.current}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, current: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                value={passwordForm.new}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, new: e.target.value })
                }
                required
              />
              {passwordForm.new && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className={`strength-fill level-${strength.level}`}
                      style={{ width: `${strength.level * 25}%` }}
                    />
                  </div>
                  <span className={`strength-label level-${strength.level}`}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirm: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </section>

        {/* Session Info */}
        <section className="account-section session-section">
          <h2>Session</h2>
          <div className="session-info">
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value status-active">
                <span className="status-dot" />
                Active
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Last Activity</span>
              <span className="detail-value">Just now</span>
            </div>
          </div>
          <button className="signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </section>

        {/* Danger Zone */}
        <section className="account-section danger-section">
          <h2>Danger Zone</h2>
          <div className="danger-content">
            <div className="danger-info">
              <h3>Delete Account</h3>
              <p>
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            {!showDeleteConfirm ? (
              <button
                className="delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </button>
            ) : (
              <div className="delete-confirm">
                <p>Type DELETE to confirm:</p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
                <div className="confirm-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="confirm-delete-btn"
                    disabled={deleteConfirmText !== 'DELETE'}
                    onClick={handleDeleteAccount}
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
