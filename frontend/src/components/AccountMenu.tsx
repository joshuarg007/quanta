// AccountMenu component - top-right avatar dropdown
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import './AccountMenu.css';

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

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

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        className="account-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="account-avatar">
          {getInitials()}
        </div>
      </button>

      {isOpen && (
        <div className="account-dropdown">
          <div className="dropdown-header">
            <div className="dropdown-avatar">
              {getInitials()}
            </div>
            <div className="dropdown-user-info">
              <span className="dropdown-email">{user?.email}</span>
              <span className="dropdown-plan">{accountTypeLabel()}</span>
            </div>
          </div>

          <div className="dropdown-divider" />

          <nav className="dropdown-nav">
            <Link
              to="/account"
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <span className="dropdown-icon">&#x1F464;</span>
              <span>Account</span>
            </Link>
            <Link
              to="/settings"
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <span className="dropdown-icon">&#x2699;</span>
              <span>Settings</span>
            </Link>
          </nav>

          <div className="dropdown-divider" />

          <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
            <span className="dropdown-icon">&#x2192;</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
