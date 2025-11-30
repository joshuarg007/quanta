import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">
          <span className="hero-logo">◈</span>
          QUANTA
        </h1>
        <p className="hero-subtitle">
          Quantum Unified Abstraction for Next-gen Algorithmics
        </p>
        <p className="hero-description">
          A visual quantum computing learning platform. Build circuits,
          simulate quantum states, and master the fundamentals of quantum mechanics.
        </p>
        <div className="hero-actions">
          <Link to="/sandbox" className="btn btn-primary">
            Open Sandbox
          </Link>
          <Link to="/learn" className="btn btn-secondary">
            Start Learning
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🔮</div>
          <h3>Visual Circuit Builder</h3>
          <p>
            Drag and drop quantum gates to build circuits. See your code
            generated in real-time with bidirectional sync.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>State Visualization</h3>
          <p>
            Watch quantum states evolve on Bloch spheres. Understand
            superposition and entanglement through interactive graphics.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📚</div>
          <h3>Guided Learning</h3>
          <p>
            Progress through structured lessons from qubits to Grover's
            algorithm. Learn by doing with hands-on exercises.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Powerful Simulation</h3>
          <p>
            Simulate up to 16 qubits with GPU acceleration.
            Powered by Qiskit for accurate quantum behavior.
          </p>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to explore quantum computing?</h2>
        <p>No hardware required. No complex setup. Just start building.</p>
        <Link to="/sandbox" className="btn btn-primary btn-large">
          Launch Sandbox →
        </Link>
      </section>

      <footer className="footer">
        <p>
          QUANTA is an open educational platform by{' '}
          <a href="https://axiondeep.com" target="_blank" rel="noopener noreferrer">
            Axion Deep Labs
          </a>
        </p>
        <p className="footer-sub">
          Gifted pro bono to university students worldwide
        </p>
      </footer>
    </div>
  );
}
