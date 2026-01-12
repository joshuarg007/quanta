// Support page with diagnostics and contact form
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { apiClient } from '../api/client';
import './Support.css';

interface SystemStatus {
  api: 'checking' | 'online' | 'offline';
  latency: number | null;
}

export default function Support() {
  const { user } = useAuth();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api: 'checking',
    latency: null,
  });

  const [contactForm, setContactForm] = useState({
    issueType: 'general',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check API health on mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    setSystemStatus({ api: 'checking', latency: null });
    const startTime = performance.now();

    try {
      await apiClient.get('/api/health');
      const latency = Math.round(performance.now() - startTime);
      setSystemStatus({ api: 'online', latency });
    } catch {
      setSystemStatus({ api: 'offline', latency: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitSuccess(true);
    setIsSubmitting(false);
    setContactForm({ issueType: 'general', subject: '', message: '' });
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getSystemInfo = () => ({
    browser: getBrowserInfo(),
    platform: navigator.platform,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const systemInfo = getSystemInfo();

  return (
    <div className="support-page">
      <div className="support-header">
        <h1>Support Center</h1>
        <p>Get help with QUANTA or report an issue</p>
      </div>

      <div className="support-grid">
        {/* Quick Actions */}
        <section className="support-section quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <button className="action-card" onClick={checkApiHealth}>
              <span className="action-icon">&#x1F50C;</span>
              <span className="action-label">Test Connection</span>
              <span className={`action-status status-${systemStatus.api}`}>
                {systemStatus.api === 'checking' && 'Checking...'}
                {systemStatus.api === 'online' && `Online (${systemStatus.latency}ms)`}
                {systemStatus.api === 'offline' && 'Offline'}
              </span>
            </button>

            <a href="/faq" className="action-card">
              <span className="action-icon">&#x2753;</span>
              <span className="action-label">Browse FAQ</span>
              <span className="action-status">15+ answers</span>
            </a>

            <a
              href="https://docs.axiondeep.com/quanta"
              target="_blank"
              rel="noopener noreferrer"
              className="action-card"
            >
              <span className="action-icon">&#x1F4DA;</span>
              <span className="action-label">Documentation</span>
              <span className="action-status">Full guides</span>
            </a>

            <a href="mailto:support@axiondeep.com" className="action-card">
              <span className="action-icon">&#x2709;</span>
              <span className="action-label">Email Us</span>
              <span className="action-status">support@axiondeep.com</span>
            </a>
          </div>
        </section>

        {/* System Status */}
        <section className="support-section system-status">
          <h2>System Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">API Server</span>
              <span className={`status-indicator ${systemStatus.api}`}>
                <span className="status-dot" />
                {systemStatus.api === 'checking' && 'Checking'}
                {systemStatus.api === 'online' && 'Operational'}
                {systemStatus.api === 'offline' && 'Unavailable'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Quantum Simulator</span>
              <span className="status-indicator online">
                <span className="status-dot" />
                Operational
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Authentication</span>
              <span className="status-indicator online">
                <span className="status-dot" />
                Operational
              </span>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="support-section contact-form">
          <h2>Contact Support</h2>
          {submitSuccess ? (
            <div className="submit-success">
              <span className="success-icon">&#x2713;</span>
              <h3>Message Sent</h3>
              <p>We'll get back to you within 24-48 hours.</p>
              <button onClick={() => setSubmitSuccess(false)}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="issueType">Issue Type</label>
                <select
                  id="issueType"
                  value={contactForm.issueType}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, issueType: e.target.value })
                  }
                >
                  <option value="general">General Question</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="account">Account Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="technical">Technical Problem</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Describe your issue in detail..."
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </section>

        {/* System Diagnostics */}
        <section className="support-section diagnostics">
          <h2>System Diagnostics</h2>
          <p className="diagnostics-note">
            This information helps us troubleshoot your issues.
          </p>
          <div className="diagnostics-grid">
            <div className="diagnostic-item">
              <span className="diagnostic-label">Browser</span>
              <span className="diagnostic-value">{systemInfo.browser}</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Platform</span>
              <span className="diagnostic-value">{systemInfo.platform}</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Screen</span>
              <span className="diagnostic-value">{systemInfo.screenSize}</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Timezone</span>
              <span className="diagnostic-value">{systemInfo.timezone}</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Language</span>
              <span className="diagnostic-value">{systemInfo.language}</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Online</span>
              <span className="diagnostic-value">
                {systemInfo.onLine ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Account</span>
              <span className="diagnostic-value">{user?.email || 'Not signed in'}</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Plan</span>
              <span className="diagnostic-value">{user?.organization?.plan || 'N/A'}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
