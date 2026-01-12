import { Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import './Home.css';

export function Home() {
  return (
    <div className="home">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">Quantum Computing Platform</div>
          <h1 className="hero-title">
            Master Quantum Computing
            <span className="hero-accent">Through Building</span>
          </h1>
          <p className="hero-description">
            Visual circuit design, real-time simulation, and structured curriculum.
            From fundamentals to Grover's and Shor's algorithms.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start Building
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/sandbox" className="btn btn-ghost btn-lg">
              Try Sandbox
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="circuit-demo">
            <div className="qubit-line">
              <span className="qubit-label">|0⟩</span>
              <div className="gate gate-h">H</div>
              <div className="wire" />
              <div className="gate gate-ctrl" />
            </div>
            <div className="qubit-line">
              <span className="qubit-label">|0⟩</span>
              <div className="wire" />
              <div className="gate gate-x">X</div>
              <div className="wire" />
              <div className="gate gate-tgt">⊕</div>
            </div>
            <div className="entangle-line" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="stat-item">
          <span className="stat-value">16</span>
          <span className="stat-label">Qubit Simulation</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">50+</span>
          <span className="stat-label">Interactive Lessons</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">Real-time</span>
          <span className="stat-label">State Visualization</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="features-inner">
          <div className="section-tag">CAPABILITIES</div>
          <h2 className="section-title">Everything You Need</h2>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 9h6M9 12h6M9 15h3" />
                </svg>
              </div>
              <div className="feature-text">
                <h3>Visual Circuit Builder</h3>
                <p>Drag-and-drop gates with real-time code sync</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v9l6 3" />
                </svg>
              </div>
              <div className="feature-text">
                <h3>Bloch Sphere</h3>
                <p>3D visualization of quantum state evolution</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              </div>
              <div className="feature-text">
                <h3>Structured Curriculum</h3>
                <p>From qubits to quantum algorithms</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div className="feature-text">
                <h3>Powerful Simulation</h3>
                <p>Up to 16 qubits with optimized engine</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3v18h18" />
                  <path d="M18 9l-5 5-4-4-3 3" />
                </svg>
              </div>
              <div className="feature-text">
                <h3>Progress Tracking</h3>
                <p>Track scores and learning milestones</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div className="feature-text">
                <h3>Team Management</h3>
                <p>Organization dashboards with roles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="pricing-inner">
          <div className="section-tag">PRICING</div>
          <h2 className="section-title">Simple, Transparent</h2>
          <p className="section-subtitle">
            No hidden fees. Free for educational institutions.
          </p>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-tier">Starter</div>
              <div className="pricing-amount">
                <span className="currency">$</span>
                <span className="price">9</span>
                <span className="period">/mo</span>
              </div>
              <p className="pricing-desc">For individual learners</p>
              <ul className="pricing-list">
                <li>200 simulations/month</li>
                <li>20 saved circuits</li>
                <li>Full curriculum</li>
                <li>Progress tracking</li>
              </ul>
              <Link to="/signup" className="btn btn-outline btn-full">Get Started</Link>
            </div>

            <div className="pricing-card pricing-featured">
              <div className="pricing-badge">Popular</div>
              <div className="pricing-tier">Professional</div>
              <div className="pricing-amount">
                <span className="currency">$</span>
                <span className="price">29</span>
                <span className="period">/mo</span>
              </div>
              <p className="pricing-desc">For serious learners</p>
              <ul className="pricing-list">
                <li>1,000 simulations/month</li>
                <li>100 saved circuits</li>
                <li>Advanced analytics</li>
                <li>Priority support</li>
                <li>API access</li>
              </ul>
              <Link to="/signup" className="btn btn-primary btn-full">Get Started</Link>
            </div>

            <div className="pricing-card">
              <div className="pricing-tier">Enterprise</div>
              <div className="pricing-amount">
                <span className="price-custom">Custom</span>
              </div>
              <p className="pricing-desc">For organizations</p>
              <ul className="pricing-list">
                <li>Unlimited simulations</li>
                <li>Unlimited circuits</li>
                <li>Admin dashboard</li>
                <li>SSO integration</li>
              </ul>
              <a href="mailto:sales@axiondeep.com" className="btn btn-outline btn-full">Contact Sales</a>
            </div>
          </div>

          <div className="pricing-edu-cta">
            <div className="edu-text">
              <strong>Educators start free.</strong>
              <span>Generous classroom tier with scalable plans for departments and institutions.</span>
            </div>
            <Link to="/educators" className="btn btn-ghost">Educator Plans →</Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-inner">
          <div className="cta-glow" />
          <h2>Ready to explore quantum computing?</h2>
          <p>No hardware required. Start building circuits in minutes.</p>
          <div className="cta-actions">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Create Account
            </Link>
            <Link to="/sandbox" className="btn btn-ghost btn-lg">
              Try Without Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <Link to="/" className="footer-brand">
            <img src="/logo-horizontal-64.png" alt="QUANTA" className="footer-logo-img" />
          </Link>
          <p className="footer-tagline">
            Quantum computing education by{' '}
            <a href="https://axiondeep.com" target="_blank" rel="noopener noreferrer">
              Axion Deep Labs
            </a>
          </p>
        </div>
        <div className="footer-links">
          <Link to="/educators">For Educators</Link>
          <a href="https://axiondeep.com/research" target="_blank" rel="noopener noreferrer">Research</a>
          <a href="mailto:support@axiondeep.com">Support</a>
        </div>
        <div className="footer-legal">
          © {new Date().getFullYear()} Axion Deep Labs
        </div>
      </footer>
    </div>
  );
}
