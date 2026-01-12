// FAQ data organized by category
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'getting-started' | 'simulation' | 'circuits' | 'learning' | 'experiments' | 'account' | 'security' | 'billing';
}

export const faqCategories = [
  { id: 'all', label: 'All' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'circuits', label: 'Circuits' },
  { id: 'learning', label: 'Learning' },
  { id: 'experiments', label: 'Experiments' },
  { id: 'account', label: 'Account' },
  { id: 'security', label: 'Security' },
  { id: 'billing', label: 'Billing' },
];

export const faqItems: FAQItem[] = [
  // Getting Started
  {
    id: 'what-is-quanta',
    question: 'What is QUANTA and how do I get started?',
    answer: `QUANTA is an interactive quantum computing education platform designed for students, researchers, and educators. It provides hands-on simulation of quantum circuits, structured learning tracks, and research-grade experimentation tools.

To get started:
1. Navigate to the Learn tab to access our curriculum
2. Start with the "Quantum Foundations" track if you're new
3. Use the Sandbox to experiment with building your own circuits
4. Check out Experiments for research-focused activities

No prior quantum computing experience is required for our beginner tracks.`,
    category: 'getting-started',
  },
  {
    id: 'quantum-background',
    question: 'What quantum computing background do I need?',
    answer: `QUANTA is designed to be accessible at multiple levels:

**Beginner**: No quantum background needed. Our Foundations track covers quantum bits, superposition, and basic gates from scratch. Basic familiarity with linear algebra is helpful but not required.

**Intermediate**: Some exposure to quantum concepts. Ready for multi-qubit systems, entanglement, and common algorithms like Grover's search.

**Advanced**: Solid quantum background. Can dive into error correction, variational algorithms, and research experiments.

The platform will guide you based on your chosen track and pace.`,
    category: 'getting-started',
  },
  // Simulation
  {
    id: 'qubit-limit',
    question: 'How many qubits can I simulate?',
    answer: `QUANTA supports up to 16 qubits for circuit simulation. This limit exists because quantum state simulation scales exponentially with qubit count:

- 10 qubits: 1,024 amplitudes
- 16 qubits: 65,536 amplitudes
- 20 qubits: ~1 million amplitudes

Beyond 16 qubits, simulation becomes computationally expensive. Our 16-qubit limit provides a good balance between educational value and performance.

For research requiring larger systems, consider using our experiment templates with parameter sweeps rather than direct simulation.`,
    category: 'simulation',
  },
  {
    id: 'result-variance',
    question: 'Why do my simulation results vary between runs?',
    answer: `Quantum mechanics is inherently probabilistic! When you measure a quantum system, you collapse it to one of the possible outcomes according to their probability amplitudes.

Our simulator faithfully reproduces this behavior:
- Each "shot" is an independent measurement
- Results follow the theoretical probability distribution
- More shots = more statistically accurate results

For example, a Hadamard gate on |0⟩ gives 50% |0⟩ and 50% |1⟩ theoretically, but with 100 shots you might see 48-52 or 55-45. With 10,000 shots, you'll see values very close to 50-50.

You can adjust the number of shots in your circuit settings.`,
    category: 'simulation',
  },
  {
    id: 'gates-supported',
    question: 'What gates are supported in the circuit builder?',
    answer: `QUANTA supports a comprehensive gate set:

**Single-Qubit Gates**:
- Pauli: X, Y, Z
- Hadamard: H
- Phase: S, S†, T, T†
- Rotation: Rx(θ), Ry(θ), Rz(θ)
- Identity: I

**Two-Qubit Gates**:
- CNOT (CX)
- CZ (Controlled-Z)
- SWAP
- Controlled rotations: CRx, CRy, CRz

**Multi-Qubit Gates**:
- Toffoli (CCX)
- Fredkin (CSWAP)

**Measurement**:
- Computational basis measurement

All gates are visually represented in the circuit builder with their standard symbols.`,
    category: 'simulation',
  },
  // Circuits
  {
    id: 'save-circuits',
    question: 'How do I save and share my circuits?',
    answer: `Circuits are automatically saved to your account as you work in the Sandbox.

**Saving**:
- Changes are auto-saved every few seconds
- Click "Save" to force an immediate save
- Name your circuits for easy identification

**Sharing**:
- Navigate to "My Circuits"
- Click the share icon on any circuit
- Copy the shareable link
- Recipients can view (and optionally clone) your circuit

**Organization**:
- Use descriptive names
- Circuits are sorted by last modified date
- You can duplicate circuits to create variations`,
    category: 'circuits',
  },
  {
    id: 'export-circuits',
    question: 'Can I export my circuits to Qiskit/Cirq?',
    answer: `Yes! QUANTA supports exporting circuits to popular quantum frameworks:

**Qiskit (IBM)**:
- Export as Python code
- Compatible with IBM Quantum Experience
- Includes gate mappings and comments

**Cirq (Google)**:
- Export as Python code
- Ready for Google quantum hardware
- Preserves circuit structure

**QASM (OpenQASM)**:
- Universal quantum assembly format
- Compatible with most simulators
- Human-readable text format

To export: Open your circuit → Click Export → Select format → Copy or download.`,
    category: 'circuits',
  },
  // Learning
  {
    id: 'progress-tracking',
    question: 'How does progress tracking work?',
    answer: `QUANTA tracks your learning progress at multiple levels:

**Lesson Progress**:
- Sections completed within each lesson
- Quiz scores and attempts
- Interactive exercise completions

**Track Progress**:
- Percentage of track completed
- Time spent in each lesson
- Estimated time remaining

**Overall Progress**:
- Total lessons completed across all tracks
- Achievements and badges earned
- Skill assessments passed

Your progress syncs across devices when you're logged in. You can always pick up exactly where you left off.`,
    category: 'learning',
  },
  {
    id: 'track-differences',
    question: "What's the difference between learning tracks?",
    answer: `QUANTA offers specialized learning tracks:

**Quantum Foundations** (Beginner):
- Qubits, superposition, measurement
- Basic gates (X, H, CNOT)
- Your first quantum circuits
- ~8 hours estimated

**Quantum Algorithms** (Intermediate):
- Deutsch-Jozsa, Grover's Search
- Quantum Fourier Transform
- Phase estimation
- ~12 hours estimated

**Quantum Error & Noise** (Advanced):
- Noise models and decoherence
- Error detection codes
- Fault-tolerant concepts
- ~10 hours estimated

Each track builds on previous knowledge. We recommend completing Foundations before other tracks.`,
    category: 'learning',
  },
  // Experiments
  {
    id: 'what-is-drift',
    question: 'What is Project DRIFT?',
    answer: `DRIFT (Degradation Regimes In Iterated Field Transformations) is our research program investigating behavioral uncertainty in quantum systems.

**Research Focus**:
- How do quantum states evolve under repeated operations?
- What causes gradual degradation in quantum simulations?
- How does operator ordering affect simulation accuracy?

**Why It Matters**:
- Understanding error accumulation
- Improving quantum algorithm design
- Characterizing simulator limitations

The Experiments tab includes DRIFT-aligned experiments that let you participate in actual research while learning. Your results contribute to our understanding of these phenomena.`,
    category: 'experiments',
  },
  {
    id: 'parameter-sweep',
    question: 'How do I run a parameter sweep experiment?',
    answer: `Parameter sweeps let you explore how changing variables affects quantum behavior:

1. **Select an Experiment**: Choose from our research templates
2. **Configure Parameters**: Set the range and step size
   - Example: Vary rotation angle from 0 to π in 10 steps
3. **Run Sweep**: Execute all configurations
4. **Analyze Results**: View trends across parameter space

**Tips**:
- Start with coarse sweeps (few steps) to find interesting regions
- Increase resolution around phase transitions
- Export data for detailed analysis

Parameter sweeps are a core tool in quantum research for characterizing system behavior.`,
    category: 'experiments',
  },
  // Account
  {
    id: 'upgrade-plan',
    question: 'How do I upgrade my plan?',
    answer: `QUANTA offers several plan tiers:

**Free**:
- 10 saved circuits
- 100 simulation runs/month
- Basic learning tracks

**Student (Free with .edu)**:
- Unlimited circuits
- 500 simulation runs/month
- All learning tracks

**Pro**:
- Unlimited everything
- Priority simulation queue
- Export features
- Research experiments

To upgrade:
1. Go to Settings → Account
2. Click "Upgrade Plan"
3. Select your tier
4. Complete payment (if applicable)

Students: Register with your .edu email for automatic upgrade.`,
    category: 'account',
  },
  {
    id: 'simulation-limit',
    question: 'What happens when I reach my simulation limit?',
    answer: `When you reach your monthly simulation limit:

**What Happens**:
- New simulations are blocked until next billing cycle
- Existing saved results remain accessible
- Learning content still available (viewing only)

**Your Options**:
1. Wait for monthly reset (first of each month)
2. Upgrade to a higher tier
3. Purchase simulation add-on pack

**Checking Usage**:
- View current usage in Settings → Usage
- Set up alerts at 50%, 75%, 90% usage

**Tip**: Reduce shots per simulation to stretch your limit further. Many educational exercises work well with 100-500 shots.`,
    category: 'account',
  },
  // Security
  {
    id: 'data-encryption',
    question: 'Is my data encrypted?',
    answer: `Yes, QUANTA takes security seriously:

**In Transit**:
- All connections use TLS 1.3
- HTTPS enforced everywhere
- Secure cookie handling

**At Rest**:
- Database encryption for sensitive data
- Passwords hashed with bcrypt
- API tokens securely stored

**Privacy**:
- We don't sell your data
- Minimal data collection
- Circuit data is private by default
- You control sharing settings

**Compliance**:
- FERPA-friendly for educational institutions
- Regular security audits

For enterprise/institutional deployments, additional security options are available.`,
    category: 'security',
  },
  {
    id: 'two-factor',
    question: 'Does QUANTA support two-factor authentication?',
    answer: `Two-factor authentication (2FA) is available for Pro and institutional accounts:

**Setup**:
1. Go to Account → Security
2. Click "Enable 2FA"
3. Scan QR code with authenticator app
4. Enter verification code
5. Save backup codes securely

**Supported Apps**:
- Google Authenticator
- Authy
- Microsoft Authenticator
- Any TOTP-compatible app

**Recovery**:
- Backup codes for emergencies
- Support-assisted recovery with identity verification

We recommend enabling 2FA for accounts with research data or institutional access.`,
    category: 'security',
  },
  // Billing
  {
    id: 'educator-pricing',
    question: 'How does educator pricing work?',
    answer: `QUANTA offers special pricing for educational institutions:

**Classroom (Free)**:
- Up to 35 students
- Basic simulation access
- Core learning tracks
- Ideal for individual courses

**Department ($49/month)**:
- Up to 150 students
- Extended simulation limits
- All learning tracks
- Usage analytics

**Institution (Custom)**:
- Unlimited students
- Custom integrations (LMS)
- Dedicated support
- SSO/SAML authentication

**To Apply**:
1. Register with institutional email
2. Navigate to Educators page
3. Select your tier
4. Verify institutional affiliation

Contact edu@axiondeep.com for institutional pricing.`,
    category: 'billing',
  },
  {
    id: 'refund-policy',
    question: 'What is the refund policy?',
    answer: `QUANTA offers a fair refund policy:

**Pro Subscriptions**:
- 14-day money-back guarantee
- Cancel anytime, keep access until period ends
- No partial month refunds after 14 days

**Simulation Add-ons**:
- Non-refundable once used
- Full refund if unused within 30 days

**Institutional**:
- Custom terms per agreement
- Contact support for adjustments

**To Request Refund**:
1. Contact support within the refund window
2. Provide order details
3. Refund processed within 5-7 business days

Questions? Email billing@axiondeep.com`,
    category: 'billing',
  },
];
