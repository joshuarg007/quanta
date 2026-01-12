import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import './Educators.css';

export default function Educators() {
  return (
    <div className="educators-page">
      <Navbar />

      {/* Hero */}
      <section className="edu-hero">
        <div className="edu-hero-glow" />
        <div className="edu-hero-badge">For Educational Institutions</div>
        <h1>
          Quantum Education,
          <span className="edu-hero-accent">Made Accessible</span>
        </h1>
        <p>
          Start teaching quantum computing with zero upfront cost. QUANTA offers
          generous free access for classrooms, with scalable plans as you grow.
        </p>
        <div className="edu-hero-actions">
          <Link to="/signup" className="btn btn-primary btn-lg">
            Get Started Free
          </Link>
          <a href="mailto:edu@axiondeep.com?subject=Education Plan Inquiry" className="btn btn-ghost btn-lg">
            Contact Sales
          </a>
        </div>
      </section>

      {/* Why Educators */}
      <section className="edu-why">
        <div className="edu-why-content">
          <h2>Built for the Classroom</h2>
          <p>
            Axion Deep Labs believes quantum education should be accessible. Our free
            Classroom tier lets any educator start teaching quantum computing today —
            no budget approval needed. Scale up only when your program grows.
          </p>
          <div className="edu-why-stats">
            <div className="edu-stat">
              <span className="edu-stat-value">Free</span>
              <span className="edu-stat-label">To get started</span>
            </div>
            <div className="edu-stat">
              <span className="edu-stat-value">35</span>
              <span className="edu-stat-label">Students included</span>
            </div>
            <div className="edu-stat">
              <span className="edu-stat-value">Full</span>
              <span className="edu-stat-label">Feature access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="edu-plans">
        <div className="edu-plans-inner">
          <div className="section-tag">EDUCATION PLANS</div>
          <h2 className="section-title">Scalable Pricing for Education</h2>
          <p className="section-subtitle">Start free, scale as your program grows</p>

          <div className="edu-plans-grid">
          <div className="edu-plan-card">
            <div className="edu-plan-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h3>Classroom</h3>
            <div className="edu-plan-price">Free</div>
            <p>Perfect for a single course or introductory quantum computing class</p>
            <ul className="edu-plan-features">
              <li>1 instructor account</li>
              <li>Up to 35 students</li>
              <li>500 simulations/student/month</li>
              <li>Full curriculum access</li>
              <li>Progress tracking</li>
              <li>Assignment creation</li>
              <li>Email support</li>
            </ul>
            <Link to="/signup" className="btn btn-primary btn-full">
              Get Started Free
            </Link>
          </div>

          <div className="edu-plan-card edu-plan-featured">
            <div className="edu-plan-badge">Most Popular</div>
            <div className="edu-plan-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
            </div>
            <h3>Department</h3>
            <div className="edu-plan-price">
              <span className="edu-price-amount">$49</span>
              <span className="edu-price-period">/month</span>
            </div>
            <p>For departments running multiple quantum courses or research groups</p>
            <ul className="edu-plan-features">
              <li>Up to 5 instructors</li>
              <li>Up to 150 students</li>
              <li>1,000 simulations/student/month</li>
              <li>LMS integration (Canvas, Moodle)</li>
              <li>Advanced analytics</li>
              <li>Data export (CSV, JSON)</li>
              <li>Priority support</li>
            </ul>
            <a href="mailto:edu@axiondeep.com?subject=Department Plan Inquiry" className="btn btn-primary btn-full">
              Contact Us
            </a>
          </div>

          <div className="edu-plan-card">
            <div className="edu-plan-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
              </svg>
            </div>
            <h3>Institution</h3>
            <div className="edu-plan-price">Custom</div>
            <p>Volume pricing for universities, colleges, and large programs</p>
            <ul className="edu-plan-features">
              <li>Unlimited instructors</li>
              <li>Unlimited students</li>
              <li>Custom simulation limits</li>
              <li>SSO integration</li>
              <li>Admin dashboard</li>
              <li>API access</li>
              <li>Dedicated support</li>
            </ul>
            <a href="mailto:edu@axiondeep.com?subject=Institution Partnership" className="btn btn-outline btn-full">
              Contact Sales
            </a>
          </div>
          </div>

          <div className="edu-plans-note">
            <p>All plans include full curriculum access. Need a research-focused plan? <a href="mailto:edu@axiondeep.com">Contact us</a> about our Research Lab options.</p>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section id="roles" className="edu-roles">
        <div className="edu-roles-inner">
          <div className="section-tag">USER ROLES</div>
          <h2 className="section-title">Role-Based Access Control</h2>
          <p className="section-subtitle">Each user type has permissions tailored to their needs</p>

        <div className="edu-roles-grid">
          <div className="edu-role-card">
            <div className="edu-role-header">
              <div className="edu-role-icon admin">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </div>
              <div>
                <h3>Administrator</h3>
                <span className="edu-role-tag">Full Control</span>
              </div>
            </div>
            <p>Department heads and IT administrators who manage the institution's QUANTA deployment</p>
            <ul className="edu-role-perms">
              <li>Manage all users and roles</li>
              <li>Approve new user registrations</li>
              <li>View organization-wide analytics</li>
              <li>Configure SSO and integrations</li>
              <li>Set usage limits and policies</li>
              <li>Access billing and licensing</li>
            </ul>
          </div>

          <div className="edu-role-card">
            <div className="edu-role-header">
              <div className="edu-role-icon teacher">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div>
                <h3>Instructor / Teacher</h3>
                <span className="edu-role-tag">Class Management</span>
              </div>
            </div>
            <p>Professors and teachers who lead quantum computing courses and manage student progress</p>
            <ul className="edu-role-perms">
              <li>Create and manage classes</li>
              <li>Design assignments and quizzes</li>
              <li>Track student progress</li>
              <li>Grade submissions</li>
              <li>Access class analytics</li>
              <li>Export student reports</li>
            </ul>
          </div>

          <div className="edu-role-card">
            <div className="edu-role-header">
              <div className="edu-role-icon student">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3>Student</h3>
                <span className="edu-role-tag">Learning Access</span>
              </div>
            </div>
            <p>Students enrolled in quantum computing courses with access to learning materials</p>
            <ul className="edu-role-perms">
              <li>Access full curriculum</li>
              <li>Build and simulate circuits</li>
              <li>Complete assignments</li>
              <li>Track personal progress</li>
              <li>Save personal circuits</li>
              <li>Earn completion certificates</li>
            </ul>
          </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="edu-start">
        <div className="edu-start-inner">
          <div className="edu-start-glow" />
          <h2>Ready to bring quantum to your classroom?</h2>
          <p>
            Get started in minutes with a free Classroom plan, or contact us for larger deployments.
          </p>
          <div className="edu-start-steps">
            <div className="edu-step">
              <div className="edu-step-num">1</div>
              <div className="edu-step-text">
                <h4>Sign Up</h4>
                <p>Create account with your .edu email</p>
              </div>
            </div>
            <div className="edu-step-arrow">→</div>
            <div className="edu-step">
              <div className="edu-step-num">2</div>
              <div className="edu-step-text">
                <h4>Verify</h4>
                <p>Confirm your academic affiliation</p>
              </div>
            </div>
            <div className="edu-step-arrow">→</div>
            <div className="edu-step">
              <div className="edu-step-num">3</div>
              <div className="edu-step-text">
                <h4>Teach</h4>
                <p>Invite students and start teaching</p>
              </div>
            </div>
          </div>
          <div className="edu-start-actions">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start Free
            </Link>
            <a href="mailto:edu@axiondeep.com?subject=Department/Institution Inquiry" className="btn btn-ghost btn-lg">
              Contact for Volume Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="edu-footer">
        <div className="edu-footer-content">
          <Link to="/" className="edu-footer-brand">
            <img src="/logo-horizontal-64.png" alt="QUANTA" className="edu-footer-logo-img" />
          </Link>
          <p>Quantum computing education by Axion Deep Labs</p>
        </div>
        <div className="edu-footer-links">
          <Link to="/">Home</Link>
          <a href="mailto:edu@axiondeep.com">Contact</a>
          <a href="mailto:support@axiondeep.com">Support</a>
        </div>
        <div className="edu-footer-legal">
          © {new Date().getFullYear()} Axion Deep Labs
        </div>
      </footer>
    </div>
  );
}
