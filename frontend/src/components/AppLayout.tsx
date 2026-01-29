// AppLayout component with sidebar for authenticated users
import { NavLink, Outlet } from 'react-router-dom';
import AccountMenu from './AccountMenu';
import './AppLayout.css';

export default function AppLayout() {
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
          <div className="nav-section">
            <span className="nav-section-label">Workspace</span>
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
              to="/experiments"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="link-icon">&#x2697;</span>
              <span>Experiments</span>
            </NavLink>
            <NavLink
              to="/circuits"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="link-icon">&#x29BF;</span>
              <span>My Circuits</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <span className="nav-section-label">Help</span>
            <NavLink
              to="/faq"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="link-icon">&#x2753;</span>
              <span>FAQ</span>
            </NavLink>
            <NavLink
              to="/support"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="link-icon">&#x2709;</span>
              <span>Support</span>
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-link settings-link ${isActive ? 'active' : ''}`}
          >
            <span className="link-icon">&#x2699;</span>
            <span>Settings</span>
          </NavLink>
          <a
            href="https://www.axiondeep.com"
            target="_blank"
            rel="noopener"
            className="built-by-link"
          >
            Built by Axion Deep Labs
          </a>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="top-bar">
          <div className="top-bar-spacer" />
          <AccountMenu />
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
