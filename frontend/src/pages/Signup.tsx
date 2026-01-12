// Signup page for QUANTA
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import './Auth.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const domain = email.includes('@') ? email.split('@')[1].toLowerCase() : '';
  const isEduEmail = domain.endsWith('.edu') || domain.endsWith('.ac.uk');
  const isAxionEmail = domain === 'axiondeep.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await register(email, password, name || undefined);

      if (response.requires_approval) {
        // User needs org approval - show message
        setPendingApproval(true);
      } else {
        // First user or auto-approved - go to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      if (message.includes('400') || message.includes('already')) {
        setError('Email already registered');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show pending approval screen
  if (pendingApproval) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <Link to="/" className="auth-back">
            <span>←</span> Back to Home
          </Link>
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon">Q</span>
              <span className="logo-text">QUANTA</span>
            </div>
            <h1>Almost there!</h1>
            <p>Your account has been created</p>
          </div>

          <div className="pending-approval">
            <div className="pending-icon">&#x23F3;</div>
            <h2>Awaiting Approval</h2>
            <p>
              Your organization administrator needs to approve your account
              before you can access QUANTA.
            </p>
            <p className="pending-email">
              We'll notify you at <strong>{email}</strong> once approved.
            </p>
          </div>

          <div className="auth-footer">
            <p>
              <Link to="/login">Back to login</Link>
            </p>
          </div>
        </div>

        <div className="auth-background">
          <div className="quantum-lines" />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-back">
          <span>←</span> Back to Home
        </Link>
        <div className="auth-header">
          <div className="auth-logo">
            <img src="/logo-horizontal-64.png" alt="QUANTA" className="auth-logo-img" />
          </div>
          <h1>Create your account</h1>
          <p>Start your quantum computing journey</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Name (optional)</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            {isEduEmail && (
              <div className="edu-notice">
                Educational email detected - you'll get the Education plan!
              </div>
            )}
            {isAxionEmail && (
              <div className="axion-notice">
                Axion Deep Labs - Research plan with unlimited access
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>

        <div className="pricing-hint">
          <p><strong>Free:</strong> 100 simulations/month, 10 circuits</p>
          <p><strong>Education (.edu):</strong> 500 simulations/month, 50 circuits</p>
        </div>
      </div>

      <div className="auth-background">
        <div className="quantum-lines" />
      </div>
    </div>
  );
}
