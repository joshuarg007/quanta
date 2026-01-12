import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import './Navbar.css';

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src="/logo-horizontal-48.png" alt="QUANTA" className="navbar-logo-img" />
      </Link>
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/educators" className="navbar-link">Educators</Link>
        {user ? (
          <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Sign In</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
