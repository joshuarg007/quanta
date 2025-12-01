// AppLayout component with sidebar for authenticated users
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import './AppLayout.css';

export default function AppLayout() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const accountTypeLabel = () => {
    switch (user?.account_type) {
      case 'student':
        return 'Student (Free Pro)';
      case 'pro':
        return 'Pro';
      case 'org_member':
        return 'Organization';
      default:
        return 'Free';
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">&#x25C8;</span>
            <span className="logo-text">QUANTA</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/sandbox"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="link-icon">&#x25A1;</span>
            <span>Sandbox</span>
          </NavLink>
          <NavLink
            to="/learn"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="link-icon">&#x25B6;</span>
            <span>Learn</span>
          </NavLink>
          <NavLink
            to="/circuits"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="link-icon">&#x29BF;</span>
            <span>My Circuits</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-email">{user?.email}</div>
            <div className="user-plan">{accountTypeLabel()}</div>
            {user?.account_type === 'free' && (
              <div className="circuits-count">
                Circuits: {user.circuits_limit} limit
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
