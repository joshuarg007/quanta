// Pre-defined experiment templates based on academic research
// Each experiment includes comprehensive theory, step-by-step guidance, and academic references

export type ExperimentDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Reference {
  title: string;
  authors?: string;
  year?: number;
  url: string;
  type: 'paper' | 'tutorial' | 'video' | 'documentation';
}

export interface ExperimentSection {
  type: 'overview' | 'theory' | 'setup' | 'circuit' | 'run' | 'analysis';
  title: string;
  content: string;
}

export interface ExperimentTemplate {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  hypothesis: string;
  learningObjectives: string[];
  prerequisites: string[];
  difficulty: ExperimentDifficulty;
  duration: number;
  driftFocus?: string;
  references: Reference[];
  tags: string[];
  config: {
    num_qubits: number;
    default_shots: number;
    parameters: {
      name: string;
      label: string;
      description: string;
      type: 'number' | 'select';
      default: number | string;
      options?: { value: string | number; label: string }[];
      min?: number;
      max?: number;
      step?: number;
    }[];
  };
  sections: ExperimentSection[];
}

export const experimentTemplates: ExperimentTemplate[] = [
  // 1. CHSH Bell Inequality Test
  {
    id: 'chsh-bell-test',
    name: 'CHSH Bell Inequality Violation',
    subtitle: 'Prove quantum entanglement is real',
    description: 'Recreate one of the most important experiments in physics history. The CHSH test demonstrates that quantum entanglement produces correlations impossible under classical physics, earning Aspect, Clauser, and Zeilinger the 2022 Nobel Prize.',
    hypothesis: 'Measurements on entangled Bell pairs will yield a CHSH parameter S > 2, violating the classical bound and proving quantum correlations cannot be explained by local hidden variables.',
    learningObjectives: [
      'Understand the EPR paradox and why Einstein called entanglement "spooky action at a distance"',
      'Learn how Bell inequalities distinguish quantum mechanics from classical theories',
      'Build and measure a maximally entangled Bell state',
      'Calculate the CHSH parameter from measurement correlations',
    ],
    prerequisites: [
      'Basic understanding of qubits and superposition',
      'Familiarity with the Hadamard and CNOT gates',
      'Understanding of quantum measurement',
    ],
    difficulty: 'intermediate',
    duration: 25,
    references: [
      {
        title: '2022 Nobel Prize in Physics - Press Release',
        authors: 'The Royal Swedish Academy of Sciences',
        year: 2022,
        url: 'https://www.nobelprize.org/prizes/physics/2022/press-release/',
        type: 'documentation',
      },
      {
        title: 'Proposed Experiment to Test Local Hidden-Variable Theories',
        authors: 'Clauser, Horne, Shimony, Holt',
        year: 1969,
        url: 'https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.23.880',
        type: 'paper',
      },
      {
        title: 'Experimental Tests of Bell Inequalities',
        authors: 'Alain Aspect',
        year: 1982,
        url: 'https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.49.91',
        type: 'paper',
      },
      {
        title: 'Bell States and Entanglement - IBM Quantum Learning',
        url: 'https://learning.quantum.ibm.com/course/basics-of-quantum-information/entanglement-in-action',
        type: 'tutorial',
      },
    ],
    tags: ['entanglement', 'bell', 'foundations', 'nobel-prize'],
    config: {
      num_qubits: 2,
      default_shots: 1024,
      parameters: [
        {
          name: 'shots',
          label: 'Measurement Shots',
          description: 'More shots = more statistically accurate results. 1024 is a good balance between speed and accuracy.',
          type: 'select',
          default: 1024,
          options: [
            { value: 256, label: '256 (fast, less accurate)' },
            { value: 512, label: '512' },
            { value: 1024, label: '1,024 (recommended)' },
            { value: 2048, label: '2,048' },
            { value: 4096, label: '4,096 (slow, most accurate)' },
          ],
        },
        {
          name: 'angleSet',
          label: 'Measurement Angles',
          description: 'The angles at which Alice and Bob measure their qubits. Optimal angles maximize the Bell violation.',
          type: 'select',
          default: 'optimal',
          options: [
            { value: 'optimal', label: 'Optimal (maximum violation)' },
            { value: 'classical', label: 'Classical-like (minimal violation)' },
            { value: 'custom', label: 'Custom angles' },
          ],
        },
      ],
    },
    sections: [
      {
        type: 'overview',
        title: 'What You Will Discover',
        content: `In 1935, Einstein, Podolsky, and Rosen (EPR) argued that quantum mechanics must be incomplete. They couldn't accept that measuring one particle could instantly affect another far away—what Einstein called "spooky action at a distance."

For decades, physicists debated: Is there a deeper "hidden variable" theory that explains quantum correlations classically?

**In 1964, John Bell changed everything.** He derived an inequality that any local hidden variable theory must satisfy. Quantum mechanics predicts this inequality can be violated.

**In this experiment, you will:**
1. Create a pair of entangled qubits (a Bell state)
2. Measure them at different angles
3. Calculate the CHSH parameter S
4. Observe S > 2, proving quantum correlations are real

This is the same type of experiment that won the 2022 Nobel Prize in Physics.`,
      },
      {
        type: 'theory',
        title: 'The Physics: Bell Inequalities Explained',
        content: `**The Setup: Alice and Bob**

Imagine Alice and Bob each receive one qubit from an entangled pair. They're far apart and can't communicate. Each randomly chooses a measurement setting (angle) and records their result (+1 or -1).

**The Classical Prediction**

If the qubits carried pre-determined "hidden" values (like a coin flip decided at creation), then the correlations between Alice's and Bob's measurements would be bounded:

|S| ≤ 2

where S = E(a,b) - E(a,b') + E(a',b) + E(a',b')

E(x,y) is the correlation when Alice measures at angle x and Bob at angle y.

**The Quantum Prediction**

Quantum mechanics predicts that for a maximally entangled state measured at optimal angles:

S = 2√2 ≈ 2.828

This is a 41% violation of the classical bound!

**Why This Matters**

If we measure S > 2, we have proven that:
- No local hidden variable theory can explain the results
- Quantum entanglement is a real, non-classical phenomenon
- Information about the quantum state is fundamentally non-local

**The Optimal Angles**

For maximum violation, use:
- Alice: a = 0°, a' = 45°
- Bob: b = 22.5°, b' = 67.5°

These angles maximize the quantum advantage over classical theories.`,
      },
      {
        type: 'setup',
        title: 'Configure Your Experiment',
        content: `Before running the Bell test, configure your measurement parameters.

**Measurement Shots**
Each "shot" is one run of the experiment—preparing a Bell pair and measuring both qubits. More shots give better statistics but take longer.

- 256 shots: Quick test, ~5% statistical uncertainty
- 1024 shots: Good balance, ~2.5% uncertainty
- 4096 shots: High precision, ~1.25% uncertainty

**Measurement Angles**
The angles determine how strongly quantum correlations appear:

- **Optimal**: Maximizes Bell violation (S ≈ 2.83)
- **Classical-like**: Angles that minimize quantum advantage
- **Custom**: Explore how different angles affect S

**What to Expect**
With optimal angles and sufficient shots, you should observe:
- S between 2.7 and 2.9 (quantum violation!)
- Individual measurements showing strong correlation
- Results that no classical theory can explain`,
      },
      {
        type: 'circuit',
        title: 'The Bell State Circuit',
        content: `**Creating Entanglement**

The circuit creates a Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2 in just two gates:

\`\`\`
q0: ──[H]──●──
           │
q1: ───────⊕──
\`\`\`

**Step 1: Hadamard Gate on Qubit 0**
- Input: |0⟩
- Output: (|0⟩ + |1⟩)/√2
- Creates superposition

**Step 2: CNOT Gate**
- Control: Qubit 0, Target: Qubit 1
- If q0 is |0⟩ → q1 stays |0⟩
- If q0 is |1⟩ → q1 flips to |1⟩
- Creates entanglement!

**The Result**
After these two gates, the qubits are maximally entangled. Measuring one instantly determines the other, no matter how far apart they are.

**Measurement**
We then rotate each qubit by the chosen angle before measuring in the computational basis. This is equivalent to measuring along a rotated axis.`,
      },
      {
        type: 'run',
        title: 'Run the Bell Test',
        content: `**Ready to Make History?**

Click "Run Experiment" to:

1. **Prepare** the Bell state |Φ+⟩
2. **Measure** at all four angle combinations (a,b), (a,b'), (a',b), (a',b')
3. **Calculate** correlations E(x,y) for each setting
4. **Compute** the CHSH parameter S

**What's Happening**
For each measurement setting, we run many shots to estimate the correlation. The correlation E(x,y) ranges from -1 (perfect anti-correlation) to +1 (perfect correlation).

**Interpreting Results**
- If |S| ≤ 2: Consistent with classical physics
- If |S| > 2: Quantum mechanics wins! Entanglement is real.

The quantum prediction is S = 2.828. Due to statistical noise and simulator imperfections, you'll likely see S between 2.6 and 2.9.`,
      },
      {
        type: 'analysis',
        title: 'Analyze Your Results',
        content: `**Understanding Your Data**

The histogram shows measurement outcomes for each angle setting. Look for:

1. **Strong correlations**: In the |Φ+⟩ state, outcomes should be correlated (both 00 or both 11)

2. **CHSH parameter S**: This is the key result
   - S ≈ 2.0: Classical bound
   - S ≈ 2.83: Quantum maximum
   - Your result should be between these

3. **Statistical uncertainty**: With N shots, uncertainty ≈ 1/√N

**What Does This Prove?**

If S > 2, you have demonstrated that:
- The universe is fundamentally non-local OR
- Measurement outcomes aren't pre-determined OR
- Both!

This rules out all "local realistic" theories—theories where particles have definite properties before measurement and can't instantly influence distant particles.

**Historical Context**
When Alain Aspect performed this experiment in 1982, it was revolutionary. Your simulation recreates this Nobel Prize-winning physics!

**Going Further**
- Try different angles to see how S changes
- Compare optimal vs. classical angle settings
- Explore how shot count affects statistical certainty`,
      },
    ],
  },

  // 2. GHZ State Preparation (moved to beginner as entry point)
  {
    id: 'ghz-state',
    name: 'GHZ State: Multi-Qubit Entanglement',
    subtitle: 'Create the ultimate entangled state',
    description: 'Build a Greenberger-Horne-Zeilinger (GHZ) state—a quantum state where multiple qubits are maximally entangled. GHZ states are fundamental to quantum computing and demonstrate entanglement in its purest form.',
    hypothesis: 'A properly prepared GHZ state will show only two measurement outcomes (all zeros or all ones), with no intermediate states, demonstrating genuine multi-particle entanglement.',
    learningObjectives: [
      'Understand the difference between 2-qubit and multi-qubit entanglement',
      'Build a GHZ state circuit using Hadamard and CNOT gates',
      'Observe the "all-or-nothing" correlation signature of GHZ states',
      'Learn why GHZ states are important for quantum error correction',
    ],
    prerequisites: [
      'Basic qubit operations (single-qubit gates)',
      'Understanding of the CNOT gate',
    ],
    difficulty: 'beginner',
    duration: 15,
    references: [
      {
        title: 'Going Beyond Bell\'s Theorem',
        authors: 'Greenberger, Horne, Zeilinger',
        year: 1989,
        url: 'https://arxiv.org/abs/0712.0921',
        type: 'paper',
      },
      {
        title: 'GHZ States - Qiskit Textbook',
        url: 'https://qiskit.org/textbook/ch-gates/multiple-qubits-entangled-states.html',
        type: 'tutorial',
      },
      {
        title: 'Multi-Qubit Entanglement - IBM Quantum',
        url: 'https://learning.quantum.ibm.com/course/basics-of-quantum-information/entanglement-in-action',
        type: 'tutorial',
      },
    ],
    tags: ['entanglement', 'ghz', 'multi-qubit', 'beginner-friendly'],
    config: {
      num_qubits: 4,
      default_shots: 1024,
      parameters: [
        {
          name: 'numQubits',
          label: 'Number of Qubits',
          description: 'More qubits = more impressive entanglement, but also more fragile to noise.',
          type: 'select',
          default: 3,
          options: [
            { value: 3, label: '3 qubits (simplest)' },
            { value: 4, label: '4 qubits' },
            { value: 5, label: '5 qubits' },
            { value: 6, label: '6 qubits (most complex)' },
          ],
        },
        {
          name: 'shots',
          label: 'Measurement Shots',
          description: 'Number of times to prepare and measure the state.',
          type: 'select',
          default: 1024,
          options: [
            { value: 256, label: '256' },
            { value: 512, label: '512' },
            { value: 1024, label: '1,024' },
            { value: 2048, label: '2,048' },
          ],
        },
      ],
    },
    sections: [
      {
        type: 'overview',
        title: 'What You Will Discover',
        content: `**The GHZ State: Entanglement Amplified**

You've learned about Bell states—two qubits entangled together. But what happens when we entangle 3, 4, or more qubits?

The GHZ state (named after physicists Greenberger, Horne, and Zeilinger) is the answer:

|GHZ⟩ = (|000...0⟩ + |111...1⟩) / √2

**What Makes GHZ Special?**

When you measure a GHZ state, something remarkable happens:
- You ONLY get all zeros (000...) or all ones (111...)
- You NEVER get mixed results like 010 or 101
- Each outcome happens with exactly 50% probability

This "all-or-nothing" behavior is the signature of genuine multi-particle entanglement.

**In this experiment, you will:**
1. Build a GHZ state with 3-6 qubits
2. Observe the characteristic two-outcome distribution
3. Verify the fidelity of your entangled state
4. See how noise affects larger GHZ states`,
      },
      {
        type: 'theory',
        title: 'Understanding GHZ States',
        content: `**From Bell to GHZ**

A Bell state entangles 2 qubits:
|Φ+⟩ = (|00⟩ + |11⟩) / √2

A GHZ state extends this to N qubits:
|GHZ_N⟩ = (|00...0⟩ + |11...1⟩) / √2

**The "All-or-Nothing" Property**

GHZ states have perfect correlations:
- If you measure any one qubit and get 0, ALL other qubits will also be 0
- If you measure any one qubit and get 1, ALL other qubits will also be 1

There's no classical explanation for this—it requires quantum entanglement.

**Fragility: The GHZ Achilles Heel**

GHZ states are extremely sensitive to noise:
- If ANY qubit decoheres, the entire entanglement is destroyed
- Larger GHZ states are exponentially more fragile
- This is why maintaining large entangled states is a major quantum computing challenge

**Applications**
- Quantum error correction codes
- Quantum secret sharing
- Quantum sensing and metrology
- Testing foundations of quantum mechanics`,
      },
      {
        type: 'setup',
        title: 'Configure Your GHZ State',
        content: `**Choose Your Parameters**

**Number of Qubits**
- 3 qubits: Classic GHZ, easiest to prepare
- 4-5 qubits: Good balance of complexity and stability
- 6 qubits: Impressive, but more sensitive to errors

**What to Expect**

For an ideal GHZ state:
- 50% probability of |000...0⟩
- 50% probability of |111...1⟩
- 0% probability of anything else

In practice (with noise):
- Dominant peaks at |000...0⟩ and |111...1⟩
- Small amounts of other states (noise)
- Fidelity = P(|000...0⟩) + P(|111...1⟩)

**GHZ Fidelity Interpretation**
- F > 0.95: Excellent entanglement
- F > 0.80: Good entanglement
- F < 0.50: Entanglement lost (worse than random)`,
      },
      {
        type: 'circuit',
        title: 'Building the GHZ Circuit',
        content: `**The GHZ Recipe**

Creating a GHZ state is beautifully simple:

\`\`\`
q0: ──[H]──●─────●─────●──
           │     │     │
q1: ───────⊕─────┼─────┼──
                 │     │
q2: ─────────────⊕─────┼──
                       │
q3: ───────────────────⊕──
\`\`\`

**Step 1: Hadamard on the First Qubit**
Creates superposition: |0⟩ → (|0⟩ + |1⟩)/√2

**Step 2: CNOT Chain**
Each CNOT copies the superposition to the next qubit:
- CNOT(0→1): Entangles qubits 0 and 1
- CNOT(0→2): Extends entanglement to qubit 2
- CNOT(0→3): Extends entanglement to qubit 3
- And so on...

**The Magic**
After the Hadamard, qubit 0 is in superposition. The CNOTs "spread" this superposition to all other qubits, but in a correlated way—creating the GHZ state.

**Circuit Depth**
- 3-qubit GHZ: depth 3 (1 H + 2 CNOT)
- 6-qubit GHZ: depth 6 (1 H + 5 CNOT)

Deeper circuits accumulate more errors on real hardware.`,
      },
      {
        type: 'run',
        title: 'Create Your GHZ State',
        content: `**Time to Entangle!**

Click "Run Experiment" to:
1. Apply the Hadamard gate to qubit 0
2. Apply the CNOT chain
3. Measure all qubits simultaneously
4. Repeat for the specified number of shots

**What to Watch For**

The measurement histogram should show:
- Two tall bars at |000...0⟩ and |111...1⟩
- Very small (or zero) bars for other states

**Understanding Errors**

If you see significant probability in other states:
- This indicates decoherence or gate errors
- In simulation, this is modeled noise
- On real hardware, this is a major challenge

**Quick Check**
Your GHZ fidelity = P(all zeros) + P(all ones)
- Above 90%? Great entanglement!
- Below 50%? Something went wrong`,
      },
      {
        type: 'analysis',
        title: 'Verify Your Entanglement',
        content: `**Reading Your Results**

**The Histogram**
You should see a "two peaks" pattern:
- Left peak: |000...0⟩ state (~50%)
- Right peak: |111...1⟩ state (~50%)
- Everything else: Noise/errors

**Calculating Fidelity**

GHZ Fidelity = P(|000...0⟩) + P(|111...1⟩)

This measures how close your state is to the ideal GHZ:
- F = 1.0: Perfect GHZ state
- F = 0.5: As good as random (no entanglement)
- F = 0.0: Orthogonal to GHZ (something weird)

**What Affects Fidelity?**
1. Gate errors (each CNOT has some error rate)
2. Decoherence (qubits lose their quantum properties)
3. Measurement errors (misreading 0 as 1 or vice versa)

**Scaling Challenge**
Try increasing the qubit count and observe how fidelity changes. This demonstrates why building large-scale quantum computers is so difficult!

**Going Further**
- Compare 3, 4, 5, 6 qubit GHZ fidelities
- Research GHZ-based quantum error correction
- Explore applications in quantum cryptography`,
      },
    ],
  },

  // 3. Quantum Phase Estimation
  {
    id: 'qpe-basic',
    name: 'Quantum Phase Estimation',
    subtitle: 'Extract eigenvalues with quantum precision',
    description: 'Learn the Quantum Phase Estimation algorithm—a fundamental subroutine that powers Shor\'s factoring algorithm, quantum chemistry simulations, and many other quantum algorithms.',
    hypothesis: 'QPE can accurately estimate the phase φ of a unitary eigenvalue e^(2πiφ) with precision exponential in the number of counting qubits.',
    learningObjectives: [
      'Understand eigenvalues and eigenvectors in quantum mechanics',
      'Learn how QPE extracts phase information',
      'Build a QPE circuit with controlled unitaries',
      'Apply inverse Quantum Fourier Transform',
    ],
    prerequisites: [
      'Understanding of eigenvalues and eigenvectors',
      'Familiarity with controlled gates',
      'Basic knowledge of the Fourier transform concept',
    ],
    difficulty: 'intermediate',
    duration: 30,
    references: [
      {
        title: 'Quantum Algorithms Revisited',
        authors: 'R. Cleve, A. Ekert, C. Macchiavello, M. Mosca',
        year: 1998,
        url: 'https://arxiv.org/abs/quant-ph/9708016',
        type: 'paper',
      },
      {
        title: 'Phase Estimation - Qiskit Textbook',
        url: 'https://qiskit.org/textbook/ch-algorithms/quantum-phase-estimation.html',
        type: 'tutorial',
      },
      {
        title: 'QPE Deep Dive - IBM Quantum Learning',
        url: 'https://learning.quantum.ibm.com/course/fundamentals-of-quantum-algorithms/phase-estimation-and-factoring',
        type: 'tutorial',
      },
      {
        title: 'Phase Estimation Video - Qiskit',
        url: 'https://www.youtube.com/watch?v=mAHC1dWnhvQ',
        type: 'video',
      },
    ],
    tags: ['algorithms', 'phase', 'estimation', 'qft'],
    config: {
      num_qubits: 5,
      default_shots: 1024,
      parameters: [
        {
          name: 'targetUnitary',
          label: 'Target Unitary Gate',
          description: 'The unitary whose eigenvalue phase we want to estimate.',
          type: 'select',
          default: 'T',
          options: [
            { value: 'T', label: 'T gate (phase = 1/8 = 0.125)' },
            { value: 'S', label: 'S gate (phase = 1/4 = 0.25)' },
            { value: 'Z', label: 'Z gate (phase = 1/2 = 0.5)' },
          ],
        },
        {
          name: 'precisionBits',
          label: 'Precision (Counting Qubits)',
          description: 'More qubits = more precision, but deeper circuit.',
          type: 'select',
          default: 3,
          options: [
            { value: 2, label: '2 bits (±0.25 precision)' },
            { value: 3, label: '3 bits (±0.125 precision)' },
            { value: 4, label: '4 bits (±0.0625 precision)' },
          ],
        },
      ],
    },
    sections: [
      {
        type: 'overview',
        title: 'What You Will Discover',
        content: `**The Power of Phase Estimation**

Quantum Phase Estimation (QPE) is one of the most important quantum algorithms. It's the engine behind:

- **Shor's Algorithm**: Factoring large numbers (breaking RSA encryption)
- **Quantum Chemistry**: Finding molecular ground states
- **Quantum Machine Learning**: Eigenvalue problems

**The Problem QPE Solves**

Given a unitary operator U and one of its eigenvectors |ψ⟩:
U|ψ⟩ = e^(2πiφ)|ψ⟩

QPE finds φ (the phase) with high precision!

**Why Is This Useful?**

Many important problems reduce to finding eigenvalues:
- Energy levels of molecules
- Period of a function (for factoring)
- Principal components of data

**In This Experiment**

We'll use simple gates (T, S, Z) with known phases to verify QPE works:
- T gate: φ = 1/8 (binary: 0.001)
- S gate: φ = 1/4 (binary: 0.01)
- Z gate: φ = 1/2 (binary: 0.1)`,
      },
      {
        type: 'theory',
        title: 'How QPE Works',
        content: `**The QPE Circuit Structure**

QPE uses two registers:
1. **Counting register**: n qubits to store the phase estimate
2. **Eigenstate register**: Prepared in |ψ⟩ (eigenstate of U)

**The Algorithm**

**Step 1: Superposition**
Put all counting qubits in superposition with Hadamard gates.

**Step 2: Controlled-U Operations**
Apply controlled-U^(2^k) for each counting qubit k.
- Qubit 0 controls U^1
- Qubit 1 controls U^2
- Qubit 2 controls U^4
- And so on...

This encodes the phase into the relative phases of the counting register.

**Step 3: Inverse QFT**
Apply inverse Quantum Fourier Transform to convert phases into computational basis states.

**Step 4: Measure**
The counting register now contains the binary representation of φ!

**Precision**
With n counting qubits, we get n bits of precision:
- 3 qubits → resolve phases to 1/8
- 4 qubits → resolve phases to 1/16

**Success Probability**
If φ has an exact n-bit representation, success probability is 100%.
Otherwise, we get the closest n-bit approximation with >80% probability.`,
      },
      {
        type: 'setup',
        title: 'Configure Phase Estimation',
        content: `**Choose Your Target**

**Target Unitary**
Select which gate's phase to estimate:

| Gate | Phase φ | Binary | Expected Output |
|------|---------|--------|-----------------|
| T | 1/8 | 0.001 | 001 (with 3 bits) |
| S | 1/4 | 0.01 | 010 (with 3 bits) |
| Z | 1/2 | 0.1 | 100 (with 3 bits) |

**Precision Bits**
More counting qubits = better precision:
- 2 bits: Can distinguish phases 0.25 apart
- 3 bits: Can distinguish phases 0.125 apart
- 4 bits: Can distinguish phases 0.0625 apart

**Important Note**
For best results, the phase should have an exact representation in your chosen precision. For example:
- T gate (φ = 1/8) needs at least 3 bits
- S gate (φ = 1/4) needs at least 2 bits
- Z gate (φ = 1/2) needs only 1 bit`,
      },
      {
        type: 'circuit',
        title: 'The QPE Circuit',
        content: `**Circuit Architecture**

For 3 counting qubits estimating the T gate:

\`\`\`
c0: ─[H]─────────●────────[QFT†]─[M]
                 │
c1: ─[H]────●────┼────────[QFT†]─[M]
            │    │
c2: ─[H]─●──┼────┼────────[QFT†]─[M]
         │  │    │
 ψ: ─────T──T²───T⁴─────────────────
\`\`\`

**Breaking It Down**

**Hadamards**: Create superposition in counting register

**Controlled Powers**:
- c2 controls T^1 (T gate applied once)
- c1 controls T^2 (T gate applied twice = S gate)
- c0 controls T^4 (T gate applied 4 times = Z gate)

**Inverse QFT**: Converts phase information to binary

**Key Insight**
The controlled-U operations "kick back" a phase to each counting qubit proportional to 2^k × φ. The inverse QFT then reads this out.

**Circuit Depth**
- Scales as O(n²) for the inverse QFT
- Plus O(n) for the controlled-U operations`,
      },
      {
        type: 'run',
        title: 'Run Phase Estimation',
        content: `**Execute the Algorithm**

Click "Run Experiment" to:
1. Prepare counting qubits in superposition
2. Apply controlled-U operations
3. Perform inverse QFT
4. Measure the counting register

**Interpreting the Output**

The measurement result is a binary number representing φ:
- Read left-to-right as binary fraction
- For 3 qubits: abc → 0.abc in binary → a/2 + b/4 + c/8

**Examples**
- Result "001" → 0.001 binary → 1/8 → T gate phase ✓
- Result "010" → 0.010 binary → 1/4 → S gate phase ✓
- Result "100" → 0.100 binary → 1/2 → Z gate phase ✓

**Multiple Outcomes?**
You might see multiple measurement results. This happens when:
- The phase doesn't have an exact n-bit representation
- Noise causes errors
- Statistical fluctuations

The most probable outcome is your best estimate of φ.`,
      },
      {
        type: 'analysis',
        title: 'Analyze Your Phase Estimate',
        content: `**Reading the Results**

**Primary Outcome**
The tallest bar in the histogram is your phase estimate. Convert it:
1. Read the binary string (e.g., "001")
2. Interpret as binary fraction: 0.001₂
3. Convert to decimal: 0×(1/2) + 0×(1/4) + 1×(1/8) = 0.125

**Verification**
Compare to known phases:
- T gate: φ = 0.125 → expect "001" (3 bits)
- S gate: φ = 0.25 → expect "010" (3 bits)
- Z gate: φ = 0.5 → expect "100" (3 bits)

**Success Metrics**
- Did you get the correct dominant outcome?
- What's the probability of the correct answer?
- How much "leakage" to adjacent values?

**Why This Matters**

In real applications like quantum chemistry:
- The phase encodes molecular energy levels
- Higher precision = more accurate chemistry
- This enables drug discovery and materials science

**Going Further**
- Try different precision settings
- Observe how adding counting qubits improves accuracy
- Research how QPE enables Shor's algorithm`,
      },
    ],
  },

  // 4. Discrete Quantum Walk
  {
    id: 'quantum-walk',
    name: 'Discrete Quantum Walk',
    subtitle: 'Watch quantum particles explore faster',
    description: 'Observe how a quantum "walker" spreads across a line quadratically faster than a classical random walk. This quantum speedup is the foundation of several quantum algorithms.',
    hypothesis: 'A quantum walk will spread with standard deviation proportional to t (time steps), while a classical random walk spreads proportionally to √t.',
    learningObjectives: [
      'Compare quantum and classical random walks',
      'Understand the coin and shift operators',
      'Observe quantum interference patterns',
      'See the origin of quantum algorithmic speedups',
    ],
    prerequisites: [
      'Basic quantum gates',
      'Understanding of superposition',
    ],
    difficulty: 'intermediate',
    duration: 20,
    references: [
      {
        title: 'Quantum Random Walks: An Introductory Overview',
        authors: 'J. Kempe',
        year: 2003,
        url: 'https://arxiv.org/abs/quant-ph/0303081',
        type: 'paper',
      },
      {
        title: 'Quantum Walks - Qiskit Tutorial',
        url: 'https://qiskit.org/textbook/ch-algorithms/quantum-walk-search-algorithm.html',
        type: 'tutorial',
      },
      {
        title: 'Quantum Walks and Search Algorithms',
        authors: 'Portugal',
        url: 'https://link.springer.com/book/10.1007/978-1-4614-6336-8',
        type: 'paper',
      },
    ],
    tags: ['walk', 'speedup', 'interference', 'algorithms'],
    config: {
      num_qubits: 6,
      default_shots: 1024,
      parameters: [
        {
          name: 'steps',
          label: 'Number of Steps',
          description: 'How many steps the walker takes. More steps show clearer quantum vs. classical differences.',
          type: 'select',
          default: 4,
          options: [
            { value: 2, label: '2 steps' },
            { value: 4, label: '4 steps' },
            { value: 6, label: '6 steps' },
            { value: 8, label: '8 steps' },
          ],
        },
        {
          name: 'coinType',
          label: 'Coin Operator',
          description: 'The coin determines how the walker chooses direction at each step.',
          type: 'select',
          default: 'hadamard',
          options: [
            { value: 'hadamard', label: 'Hadamard (symmetric spread)' },
            { value: 'grover', label: 'Grover (search-optimized)' },
            { value: 'biased', label: 'Biased (asymmetric spread)' },
          ],
        },
      ],
    },
    sections: [
      {
        type: 'overview',
        title: 'What You Will Discover',
        content: `**Random Walks: Classical vs. Quantum**

A random walk is simple: flip a coin, move left or right based on the result. After many steps, where do you end up?

**Classical Random Walk**
- Position follows a Gaussian (bell curve) distribution
- Spread grows as √t (square root of steps)
- After 100 steps: spread of ~10 positions

**Quantum Random Walk**
- Position shows interference patterns
- Spread grows as t (linear in steps!)
- After 100 steps: spread of ~100 positions

This quadratic speedup is at the heart of many quantum algorithms!

**In This Experiment**

You'll:
1. Simulate a quantum walk on a 1D line
2. Observe the characteristic "two-peaked" distribution
3. Compare how spread scales with steps
4. See quantum interference in action`,
      },
      {
        type: 'theory',
        title: 'Quantum Walk Mechanics',
        content: `**Components of a Quantum Walk**

**1. Position Space**
The walker can be at positions ..., -2, -1, 0, 1, 2, ...
Encoded in qubits as binary numbers.

**2. Coin Space**
An extra qubit that determines direction:
- |0⟩ = move left
- |1⟩ = move right

**3. Coin Operator (C)**
Creates superposition of left/right:
- Hadamard: Equal left/right
- Biased: Prefer one direction

**4. Shift Operator (S)**
Moves the walker based on coin state:
- If coin is |0⟩: position → position - 1
- If coin is |1⟩: position → position + 1

**One Step = C then S**

The walker doesn't collapse to one direction—it goes BOTH ways in superposition!

**Interference**
Different paths to the same position can interfere:
- Constructive: Amplitudes add → higher probability
- Destructive: Amplitudes cancel → lower probability

This is why quantum walks show peaks at the edges, not a bell curve in the middle!`,
      },
      {
        type: 'setup',
        title: 'Configure Your Quantum Walk',
        content: `**Walk Parameters**

**Number of Steps**
More steps = clearer quantum vs. classical difference:
- 2 steps: Minimal spreading
- 4 steps: Beginning to see interference
- 6-8 steps: Clear quantum pattern

**Coin Operator**

**Hadamard (Recommended)**
- Creates equal superposition of left/right
- Symmetric spread
- Classic quantum walk behavior

**Grover Coin**
- Used in quantum search algorithms
- Different interference pattern
- Optimized for certain problems

**Biased Coin**
- Unequal left/right probabilities
- Asymmetric spread
- Shows how coin choice affects walk

**What to Expect**

After several steps, you should see:
- Two peaks at the edges (±n/√2 from origin)
- Low probability at the center
- Very different from classical Gaussian!`,
      },
      {
        type: 'circuit',
        title: 'Walk Circuit Structure',
        content: `**Circuit Layout**

\`\`\`
coin: ─[H]─●─[H]─●─[H]─●─[H]─●─ ... ─[M]
           │     │     │     │
pos:  ─────S─────S─────S─────S─ ... ─[M]
\`\`\`

Each step: Coin flip (H) → Conditional shift (S)

**Position Encoding**

With n position qubits, we can represent 2^n positions:
- 4 qubits: 16 positions (-8 to +7)
- 6 qubits: 64 positions (-32 to +31)

**The Shift Operator**

The shift operator is complex but logical:
- Controlled on coin state
- Increments/decrements position register
- Implemented using controlled additions

**Growing Superposition**

After k steps, the walker is in superposition of up to 2k+1 positions (all positions reachable in k steps).`,
      },
      {
        type: 'run',
        title: 'Start the Walk',
        content: `**Execute the Quantum Walk**

The simulation will:
1. Initialize walker at position 0 with coin |0⟩
2. Apply k steps of (Coin → Shift)
3. Measure final position
4. Repeat for statistics

**Watching the Walk**

Imagine the walker spreading out like a wave:
- Step 1: Positions -1 and +1 in superposition
- Step 2: Positions -2, 0, +2 in superposition
- Each step: Wave spreads and interferes

**Classical Comparison**

A classical random walk would show:
- Bell curve centered at origin
- Maximum probability at center
- Spread ∝ √(steps)

**Quantum Expectation**

The quantum walk should show:
- Peaks at the edges
- Low probability at center
- Spread ∝ steps (quadratic speedup!)`,
      },
      {
        type: 'analysis',
        title: 'Analyze the Walk Distribution',
        content: `**Reading the Results**

**Position Distribution**
The x-axis shows positions, y-axis shows probability.

**Quantum Signature**
Look for:
- Two prominent peaks at ±(steps)/√2
- Interference fringes between peaks
- Low probability at the origin

**Compare to Classical**
A classical walk would show:
- Single peak at origin
- Gaussian decay away from center
- No interference pattern

**Speedup Calculation**

Standard deviation after t steps:
- Classical: σ ∝ √t
- Quantum: σ ∝ t

For t = 100 steps: quantum spreads 10x faster!

**Why Does This Matter?**

This speedup enables:
- Grover's search algorithm
- Quantum spatial search
- Faster graph algorithms
- Element distinctness problem

**Going Further**
- Compare different step counts
- Try different coin operators
- Research quantum walk-based algorithms`,
      },
    ],
  },

  // 5. Trotter Ordering Study (DRIFT Core)
  {
    id: 'trotter-ordering',
    name: 'Trotter Ordering Effects',
    subtitle: 'How gate order affects simulation accuracy',
    description: 'Investigate a core question in quantum simulation: does the order of operations matter? This DRIFT experiment explores how operator ordering affects Hamiltonian simulation error.',
    hypothesis: 'Different orderings of the same Trotter decomposition will produce measurably different errors, with optimal orderings potentially reducing error by 50% or more.',
    learningObjectives: [
      'Understand Trotter-Suzuki decomposition for Hamiltonian simulation',
      'Learn why operator ordering matters in quantum simulation',
      'Observe how Trotter error scales with step count',
      'Contribute to DRIFT research on simulation optimization',
    ],
    prerequisites: [
      'Understanding of Hamiltonians and time evolution',
      'Familiarity with quantum gates and circuits',
      'Basic linear algebra (matrix exponentials)',
    ],
    difficulty: 'advanced',
    duration: 35,
    driftFocus: 'operator_ordering',
    references: [
      {
        title: 'Ordering of Trotterization: Impact on Errors',
        authors: 'Tranter, Love, Mintert, Coveney',
        year: 2019,
        url: 'https://www.mdpi.com/1099-4300/21/12/1218',
        type: 'paper',
      },
      {
        title: 'Product Formulas for Exponentials of Commutators',
        authors: 'Childs, Su, Tran, Wiebe, Zhu',
        year: 2021,
        url: 'https://arxiv.org/abs/1912.08854',
        type: 'paper',
      },
      {
        title: 'Hamiltonian Simulation - Qiskit Tutorial',
        url: 'https://qiskit.org/textbook/ch-algorithms/hamiltonian-simulation.html',
        type: 'tutorial',
      },
      {
        title: 'DRIFT Research Program',
        url: '/faq#what-is-drift',
        type: 'documentation',
      },
    ],
    tags: ['drift', 'trotter', 'ordering', 'simulation', 'research'],
    config: {
      num_qubits: 4,
      default_shots: 2048,
      parameters: [
        {
          name: 'hamiltonianType',
          label: 'Hamiltonian Model',
          description: 'Physical system to simulate. Each has different operator structures.',
          type: 'select',
          default: 'heisenberg',
          options: [
            { value: 'heisenberg', label: 'Heisenberg XXX (spin chain)' },
            { value: 'ising', label: 'Transverse Ising (phase transition)' },
            { value: 'xy', label: 'XY Model (2D magnets)' },
          ],
        },
        {
          name: 'trotterSteps',
          label: 'Trotter Steps',
          description: 'More steps = smaller error, but deeper circuit.',
          type: 'select',
          default: 4,
          options: [
            { value: 1, label: '1 step (large error)' },
            { value: 2, label: '2 steps' },
            { value: 4, label: '4 steps (recommended)' },
            { value: 8, label: '8 steps (small error, deep circuit)' },
          ],
        },
        {
          name: 'orderingStrategy',
          label: 'Operator Ordering',
          description: 'How to arrange operators in the Trotter formula.',
          type: 'select',
          default: 'reference',
          options: [
            { value: 'reference', label: 'Reference (canonical)' },
            { value: 'reversed', label: 'Reversed' },
            { value: 'interleaved', label: 'Interleaved' },
            { value: 'random', label: 'Random (each run different)' },
          ],
        },
      ],
    },
    sections: [
      {
        type: 'overview',
        title: 'DRIFT Experiment: Why Ordering Matters',
        content: `**The Quantum Simulation Challenge**

One of quantum computing's killer applications is simulating quantum systems—molecules, materials, and physical phenomena. But there's a problem:

The time evolution operator e^(-iHt) can't be directly implemented when H is a sum of non-commuting terms.

**The Trotter Solution**

Trotter-Suzuki decomposition approximates:
e^(-i(A+B)t) ≈ (e^(-iAt/n) e^(-iBt/n))^n

More steps (larger n) = smaller error.

**The DRIFT Question**

What if we have many terms: H = A + B + C + D + ...?

Different orderings are mathematically equivalent:
- ABC ordering
- BCA ordering
- CAB ordering
- etc.

**But are they equivalent in practice?**

This experiment investigates whether some orderings produce smaller errors—potentially improving quantum simulations without any additional cost.

**Your Contribution**
By running this experiment, you're contributing to DRIFT research on optimizing quantum simulations.`,
      },
      {
        type: 'theory',
        title: 'Trotter Error and Ordering',
        content: `**The Trotter Formula**

For Hamiltonian H = A + B (where [A,B] ≠ 0):

**First-order Trotter:**
e^(-iHt) ≈ (e^(-iAt/n) e^(-iBt/n))^n
Error: O(t²/n)

**Second-order Trotter:**
e^(-iHt) ≈ (e^(-iAt/2n) e^(-iBt/n) e^(-iAt/2n))^n
Error: O(t³/n²)

**The Ordering Question**

When H = A + B + C + ..., we can apply terms in any order:
- e^(-iA) e^(-iB) e^(-iC) ...
- e^(-iC) e^(-iA) e^(-iB) ...
- etc.

The Baker-Campbell-Hausdorff formula shows error depends on commutators [A,B], [B,C], etc.

**Tranter et al. (2019) Key Finding:**
"The choice of ordering can affect error by a factor of 2 or more, without any additional quantum resources."

**Why This Matters**
- Free error reduction
- No additional gates needed
- Could improve near-term quantum advantages

**DRIFT Focus**
We're studying how ordering effects scale with:
- System size
- Hamiltonian type
- Number of Trotter steps`,
      },
      {
        type: 'setup',
        title: 'Configure the Simulation',
        content: `**Choose Your System**

**Hamiltonian Type**

**Heisenberg XXX Model**
H = Σ(XiXj + YiYj + ZiZj)
- Spin-spin interactions in all directions
- Many non-commuting terms
- Large ordering effects expected

**Transverse Ising Model**
H = Σ(ZiZj) + h·Σ(Xi)
- Nearest-neighbor ZZ + transverse field
- Simpler commutator structure
- Benchmark for quantum simulation

**XY Model**
H = Σ(XiXj + YiYj)
- 2D magnetism model
- Moderate complexity

**Trotter Steps**
More steps = smaller Trotter error but:
- Deeper circuits
- More gate errors on real hardware
- Longer simulation time

**Ordering Strategy**
- Reference: Standard ordering (for comparison)
- Reversed: Opposite of reference
- Interleaved: Alternating pattern
- Random: Different each run (for statistics)`,
      },
      {
        type: 'circuit',
        title: 'Trotterized Circuit',
        content: `**Circuit Structure**

For Heisenberg model on 4 qubits with 2 Trotter steps:

\`\`\`
Step 1:
q0: ─[XX]─[YY]─[ZZ]─────────────────────
     │    │    │
q1: ─[XX]─[YY]─[ZZ]─[XX]─[YY]─[ZZ]──────
                    │    │    │
q2: ────────────────[XX]─[YY]─[ZZ]─[XX]─
                                   │
q3: ───────────────────────────────[XX]─

(Repeat for Step 2)
\`\`\`

**Operator Decomposition**

Each interaction term decomposes into native gates:
- XX interaction: RXX(θ) gate
- YY interaction: RYY(θ) gate
- ZZ interaction: RZZ(θ) gate

**Ordering Variations**

**Reference:** Apply terms in index order (0-1, 1-2, 2-3, ...)
**Reversed:** Apply terms in reverse order (..., 2-3, 1-2, 0-1)
**Interleaved:** Apply even bonds, then odd bonds

**Circuit Depth**
- 1 Trotter step: ~3N gates (N = qubits)
- k Trotter steps: ~3Nk gates`,
      },
      {
        type: 'run',
        title: 'Run Trotter Simulation',
        content: `**Execute the Simulation**

The experiment will:
1. Prepare initial state |ψ₀⟩
2. Apply Trotterized evolution with chosen ordering
3. Measure final state
4. Compare to exact evolution (computed classically)

**Fidelity Measurement**

We compute fidelity between:
- Trotterized final state |ψ_Trotter⟩
- Exact final state |ψ_exact⟩

F = |⟨ψ_exact|ψ_Trotter⟩|²

**Running Multiple Orderings**

To compare orderings fairly:
1. Run with "Reference" ordering → get F_ref
2. Run with "Reversed" ordering → get F_rev
3. Compare: Is F_ref > F_rev?

**Statistical Significance**

Run multiple times to account for:
- Measurement noise
- Random ordering variability`,
      },
      {
        type: 'analysis',
        title: 'Analyze Ordering Effects',
        content: `**Understanding Your Results**

**Fidelity Comparison**

Higher fidelity = better simulation:
- F > 0.99: Excellent (small Trotter error)
- F > 0.95: Good
- F > 0.90: Acceptable
- F < 0.80: Large error

**Ordering Impact**

Compare fidelities across orderings:
- If F_interleaved > F_reference: Interleaving helps!
- Typical improvement: 10-50% error reduction

**Error Scaling**

With more Trotter steps:
- All orderings improve
- But ordering differences persist
- Ratio of errors roughly constant

**DRIFT Research Questions**

Your data contributes to answering:
1. Are there universal "best" orderings?
2. How does optimal ordering depend on Hamiltonian type?
3. Can we predict good orderings without simulation?

**Going Further**
- Try all ordering strategies
- Compare different Hamiltonians
- Vary Trotter steps to see scaling
- Read the Tranter et al. paper for context`,
      },
    ],
  },

  // 6. VQE Noise Sensitivity
  {
    id: 'vqe-noise',
    name: 'VQE Noise Sensitivity',
    subtitle: 'How noise limits quantum chemistry',
    description: 'Explore how noise affects the Variational Quantum Eigensolver—the leading algorithm for near-term quantum chemistry. Understand why error mitigation is crucial for quantum advantage.',
    hypothesis: 'VQE accuracy degrades predictably with noise level, with hardware-efficient ansätze being more resilient than deeper chemically-inspired circuits.',
    learningObjectives: [
      'Understand how VQE finds molecular ground states',
      'See how noise creates "barren plateaus" in optimization',
      'Compare ansatz architectures for noise resilience',
      'Learn why error mitigation is essential',
    ],
    prerequisites: [
      'Basic understanding of optimization',
      'Familiarity with parameterized quantum circuits',
      'Concept of ground state energy',
    ],
    difficulty: 'advanced',
    duration: 35,
    references: [
      {
        title: 'A Variational Eigenvalue Solver on a Photonic Quantum Processor',
        authors: 'Peruzzo et al.',
        year: 2014,
        url: 'https://www.nature.com/articles/ncomms5213',
        type: 'paper',
      },
      {
        title: 'Effect of Noise on VQE',
        authors: 'Wang et al.',
        year: 2021,
        url: 'https://arxiv.org/abs/2010.14821',
        type: 'paper',
      },
      {
        title: 'VQE Tutorial - Qiskit',
        url: 'https://qiskit.org/textbook/ch-applications/vqe-molecules.html',
        type: 'tutorial',
      },
      {
        title: 'Noise-Induced Barren Plateaus',
        authors: 'Wang et al.',
        year: 2021,
        url: 'https://arxiv.org/abs/2111.05176',
        type: 'paper',
      },
    ],
    tags: ['vqe', 'nisq', 'noise', 'variational', 'chemistry'],
    config: {
      num_qubits: 4,
      default_shots: 2048,
      parameters: [
        {
          name: 'ansatzType',
          label: 'Ansatz Architecture',
          description: 'The structure of the parameterized circuit.',
          type: 'select',
          default: 'hardware_efficient',
          options: [
            { value: 'hardware_efficient', label: 'Hardware Efficient (shallow)' },
            { value: 'uccsd', label: 'UCCSD-inspired (deep, chemical)' },
            { value: 'qaoa', label: 'QAOA-like (alternating)' },
          ],
        },
        {
          name: 'noiseLevel',
          label: 'Noise Level',
          description: 'Simulated gate error rate.',
          type: 'select',
          default: 'low',
          options: [
            { value: 'none', label: 'None (ideal simulation)' },
            { value: 'low', label: 'Low (0.1% per gate)' },
            { value: 'medium', label: 'Medium (1% per gate)' },
            { value: 'high', label: 'High (5% per gate)' },
          ],
        },
        {
          name: 'layers',
          label: 'Ansatz Depth',
          description: 'Number of repeated layers. More layers = more expressive but noisier.',
          type: 'select',
          default: 2,
          options: [
            { value: 1, label: '1 layer (shallow)' },
            { value: 2, label: '2 layers (moderate)' },
            { value: 3, label: '3 layers (deep)' },
          ],
        },
      ],
    },
    sections: [
      {
        type: 'overview',
        title: 'VQE: Quantum Chemistry on NISQ Devices',
        content: `**The Promise of Quantum Chemistry**

Simulating molecules exactly is exponentially hard for classical computers. A caffeine molecule has ~10⁴⁸ possible configurations!

VQE (Variational Quantum Eigensolver) offers hope:
- Uses hybrid quantum-classical approach
- Designed for noisy near-term devices
- Has demonstrated small molecule simulations

**How VQE Works**

1. **Ansatz**: Prepare a parameterized quantum state |ψ(θ)⟩
2. **Measure**: Estimate energy E(θ) = ⟨ψ(θ)|H|ψ(θ)⟩
3. **Optimize**: Classical computer updates θ to minimize E
4. **Repeat**: Until convergence

**The Noise Problem**

In theory, VQE should find the ground state energy.
In practice, noise creates challenges:
- Biased energy estimates
- Flat optimization landscapes ("barren plateaus")
- Limited circuit depth

**This Experiment**

You'll explore how noise affects VQE:
- Compare noise levels
- Test different ansatz architectures
- See why shallow circuits are preferred`,
      },
      {
        type: 'theory',
        title: 'Understanding VQE and Noise',
        content: `**The Variational Principle**

For any trial state |ψ⟩:
E_trial = ⟨ψ|H|ψ⟩ ≥ E_ground

The ground state energy is the minimum possible energy. VQE searches for parameters that minimize E_trial.

**Ansatz Design**

**Hardware Efficient Ansatz**
- Single-qubit rotations + entangling gates
- Native to hardware (minimal compilation)
- Shallow circuits = less noise accumulation
- May not capture all chemistry

**UCCSD (Unitary Coupled Cluster)**
- Chemically inspired
- Captures electron correlation
- Deep circuits = more noise
- Theoretically better for chemistry

**QAOA-like**
- Alternating mixer and cost layers
- Good for optimization problems
- Intermediate depth

**Noise Effects**

**Depolarizing Noise**
- Random errors with probability p
- Averages out quantum features
- Energy estimate biased toward zero

**Barren Plateaus**
- Gradients become exponentially small
- Optimization gets stuck
- Worse with more qubits and depth`,
      },
      {
        type: 'setup',
        title: 'Configure VQE Simulation',
        content: `**Experimental Setup**

**Ansatz Selection**
- Hardware Efficient: Best noise resilience
- UCCSD: Best chemical accuracy (if no noise)
- QAOA: Middle ground

**Noise Level**
Real quantum computers have ~0.1-1% error per gate.
- None: Ideal baseline
- Low (0.1%): Optimistic near-term
- Medium (1%): Typical current hardware
- High (5%): Challenging conditions

**Circuit Depth**
More layers = more expressivity but:
- More gates = more noise
- Harder optimization
- Potential barren plateaus

**What to Compare**

Run with multiple settings:
1. Ideal (no noise) → baseline accuracy
2. Low noise → near-term expectation
3. High noise → stress test

Compare how energy estimate deviates from true ground state.`,
      },
      {
        type: 'circuit',
        title: 'Ansatz Circuit',
        content: `**Hardware Efficient Ansatz (2 layers)**

\`\`\`
q0: ─[Ry]─[Rz]─●──────────[Ry]─[Rz]─●──────────
              │                     │
q1: ─[Ry]─[Rz]─⊕──●────────[Ry]─[Rz]─⊕──●────────
                 │                     │
q2: ─[Ry]─[Rz]───⊕──●──────[Ry]─[Rz]───⊕──●──────
                    │                     │
q3: ─[Ry]─[Rz]──────⊕──────[Ry]─[Rz]──────⊕──────
\`\`\`

**Parameters**
- Each Ry, Rz gate has one parameter
- 2 parameters per qubit per layer
- 4 qubits × 2 params × 2 layers = 16 parameters

**UCCSD Ansatz**
Much deeper:
- Includes excitation operators
- ~50+ CNOT gates for 4 qubits
- More accurate but more noise-sensitive

**Optimization**
Classical optimizer (e.g., COBYLA) adjusts parameters to minimize measured energy.`,
      },
      {
        type: 'run',
        title: 'Run VQE Optimization',
        content: `**Execute VQE**

The simulation will:
1. Initialize random parameters
2. Run optimization loop:
   - Evaluate energy at current parameters
   - Update parameters (classical optimizer)
   - Repeat until convergence
3. Report final energy estimate

**Watching Optimization**

You'll see:
- Energy vs. iteration plot
- Convergence behavior
- Final energy estimate

**Noise Impact**

With increasing noise:
- Convergence slows
- Final energy deviates from true value
- Optimization may get stuck

**True Ground State**

For comparison, we show the exact ground state energy (computed classically for this small system).

Accuracy = |E_VQE - E_exact| / |E_exact|`,
      },
      {
        type: 'analysis',
        title: 'Analyze Noise Effects',
        content: `**Interpreting Results**

**Energy Accuracy**
- Ideal: Should reach exact ground state
- Low noise: ~1-5% error typical
- High noise: Can be 10-50% error

**Optimization Landscape**

With noise, the landscape becomes:
- Flatter (smaller gradients)
- More local minima
- Harder to navigate

**Ansatz Comparison**

Expected pattern:
- Hardware Efficient: More noise-resilient
- UCCSD: Better ideal accuracy, worse with noise
- Crossover point depends on noise level

**Key Insights**

1. **Shallow is better** for near-term devices
2. **Error mitigation** is essential for accuracy
3. **Shot noise** adds to gate noise
4. **Barren plateaus** limit scalability

**Going Further**
- Compare all ansatz types
- Find the noise threshold where VQE fails
- Research error mitigation techniques
- Read the noise-induced barren plateaus paper`,
      },
    ],
  },

  // 7. Randomized Benchmarking
  {
    id: 'randomized-benchmarking',
    name: 'Randomized Benchmarking',
    subtitle: 'Measure your quantum computer\'s accuracy',
    description: 'Learn the industry-standard technique for characterizing quantum gate fidelity. Randomized benchmarking isolates gate errors from preparation and measurement errors.',
    hypothesis: 'Gate fidelity can be extracted from the exponential decay of sequence fidelity vs. length, revealing the average error per Clifford gate.',
    learningObjectives: [
      'Understand why benchmarking quantum computers is challenging',
      'Learn how RB isolates gate errors from SPAM errors',
      'Calculate error per gate from decay curves',
      'Interpret fidelity numbers in context',
    ],
    prerequisites: [
      'Basic quantum gates',
      'Understanding of the Clifford group',
      'Basic probability and statistics',
    ],
    difficulty: 'advanced',
    duration: 25,
    references: [
      {
        title: 'Scalable and Robust Randomized Benchmarking',
        authors: 'Magesan, Gambetta, Emerson',
        year: 2012,
        url: 'https://arxiv.org/abs/1109.6887',
        type: 'paper',
      },
      {
        title: 'Randomized Benchmarking - Qiskit Tutorial',
        url: 'https://qiskit.org/documentation/experiments/tutorials/randomized_benchmarking.html',
        type: 'tutorial',
      },
      {
        title: 'Characterizing Quantum Gates via Randomized Benchmarking',
        authors: 'Knill et al.',
        year: 2008,
        url: 'https://arxiv.org/abs/0707.0963',
        type: 'paper',
      },
    ],
    tags: ['benchmarking', 'fidelity', 'characterization', 'clifford'],
    config: {
      num_qubits: 1,
      default_shots: 2048,
      parameters: [
        {
          name: 'maxLength',
          label: 'Maximum Sequence Length',
          description: 'Longest Clifford sequence to test. Longer sequences reveal smaller error rates.',
          type: 'select',
          default: 64,
          options: [
            { value: 16, label: '16 gates' },
            { value: 32, label: '32 gates' },
            { value: 64, label: '64 gates' },
            { value: 128, label: '128 gates' },
          ],
        },
        {
          name: 'samples',
          label: 'Samples per Length',
          description: 'Random sequences per length point. More = better statistics.',
          type: 'select',
          default: 10,
          options: [
            { value: 5, label: '5 samples' },
            { value: 10, label: '10 samples' },
            { value: 20, label: '20 samples' },
          ],
        },
        {
          name: 'gateSet',
          label: 'Gate Set',
          description: 'Which gates to benchmark.',
          type: 'select',
          default: 'clifford',
          options: [
            { value: 'clifford', label: 'Full Clifford group' },
            { value: 'pauli', label: 'Pauli gates only' },
          ],
        },
      ],
    },
    sections: [
      {
        type: 'overview',
        title: 'Why Randomized Benchmarking?',
        content: `**The Benchmarking Challenge**

How do you measure quantum gate accuracy? The obvious approach:
1. Prepare |0⟩
2. Apply gate
3. Measure
4. Compare to expected

Problem: Errors in preparation and measurement (SPAM) contaminate the result!

**The RB Solution**

Randomized Benchmarking cleverly separates:
- **Gate errors**: What we want to measure
- **SPAM errors**: Preparation and measurement imperfections

**How It Works**

1. Apply m random Clifford gates
2. Compute and apply the inverse (returns to |0⟩)
3. Measure survival probability
4. Repeat for different m values
5. Fit exponential decay

**Key Insight**

The decay rate depends ONLY on gate errors:
P(|0⟩) = A × p^m + B

where p = 1 - r(d-1)/d and r = error per gate.

**This Experiment**

You'll:
- Run RB sequences of various lengths
- Observe exponential decay
- Extract the error per gate
- Compare to quoted fidelity numbers`,
      },
      {
        type: 'theory',
        title: 'RB Theory and Mathematics',
        content: `**The Clifford Group**

Cliffords are gates that map Paulis to Paulis:
C · P · C† ∈ {±I, ±X, ±Y, ±Z} for any Pauli P

Single-qubit Cliffords: 24 elements
Generated by: H, S, X (Hadamard, Phase, Pauli-X)

**Why Cliffords?**

1. Form a group (any sequence is equivalent to one Clifford)
2. Inverse can be efficiently computed
3. Twirl noise into depolarizing channel

**The RB Protocol**

For sequence length m:
1. Choose m random Cliffords: C₁, C₂, ..., Cₘ
2. Compute total: Cₜₒₜ = Cₘ · ... · C₂ · C₁
3. Compute inverse: Cₘ₊₁ = Cₜₒₜ⁻¹
4. Apply C₁, C₂, ..., Cₘ, Cₘ₊₁
5. Measure probability of |0⟩

**The Model**

P(|0⟩) = A · p^m + B

- A: SPAM-related amplitude (~0.5)
- B: SPAM-related offset (~0.5)
- p: Depolarizing parameter
- m: Sequence length

**Error Per Gate**

Error per Clifford: r = (1-p)(d-1)/d

For single qubit (d=2): r = (1-p)/2

**Example**
If p = 0.99, then r = 0.005 = 0.5% error per gate.`,
      },
      {
        type: 'setup',
        title: 'Configure Benchmarking',
        content: `**RB Parameters**

**Sequence Lengths**
We test at multiple lengths:
- Short (1, 2, 4): High survival, dominated by SPAM
- Medium (8, 16, 32): Decay becomes visible
- Long (64, 128): Low survival, reveals small errors

**Samples per Length**
Different random sequences average out statistical fluctuations:
- 5: Quick but noisy
- 10: Good balance
- 20: High precision

**Gate Set**
- Full Clifford: Standard RB, averages over all single-qubit gates
- Pauli only: Simpler, may miss some errors

**Interpreting Results**

Industry benchmarks (single-qubit):
- > 99.9% (0.1% error): State-of-the-art
- > 99% (1% error): Good
- > 95% (5% error): Needs improvement

**Comparison to Quoted Fidelities**
RB measures average fidelity over the gate set. Individual gates may vary. RB is robust to SPAM errors.`,
      },
      {
        type: 'circuit',
        title: 'RB Circuit Structure',
        content: `**Example RB Sequence (m=4)**

\`\`\`
|0⟩ ─[C₁]─[C₂]─[C₃]─[C₄]─[C₅=inverse]─[M]
\`\`\`

where C₅ = (C₄·C₃·C₂·C₁)⁻¹

**Concrete Example**

Random sequence: H, S, X, H
Product: H·X·S·H = ... (compute)
Inverse: ... (apply to return to |0⟩)

**Clifford Decomposition**

Each Clifford decomposes into native gates:
- Identity: (nothing)
- X: X gate
- H: H gate
- S: S gate
- HS: H then S
- etc.

Average: ~1.5 native gates per Clifford

**Circuit Depth**

For sequence length m:
- ~1.5m native single-qubit gates
- Plus inverse (~1.5 gates average)
- Total: ~1.5(m+1) gates`,
      },
      {
        type: 'run',
        title: 'Run Benchmarking',
        content: `**Execute RB Protocol**

The simulation will:
1. For each sequence length (1, 2, 4, 8, ...):
   - Generate random Clifford sequences
   - Compute and append inverses
   - Execute and measure
   - Record survival probability
2. Fit decay curve
3. Extract error rate

**What You'll See**

**Decay Curve**
- X-axis: Sequence length m
- Y-axis: Survival probability
- Exponential decay from ~1 to ~0.5

**Fit Parameters**
- p (depolarizing parameter)
- A, B (SPAM parameters)
- r (error per gate)

**Goodness of Fit**
R² should be high (>0.95) for meaningful results.`,
      },
      {
        type: 'analysis',
        title: 'Interpret Fidelity Results',
        content: `**Reading the Results**

**Decay Curve**
Smooth exponential decay indicates consistent errors.
Deviations suggest non-Markovian noise or calibration drift.

**Error Per Clifford**

r = (1-p)/2 for single qubit

Convert to fidelity: F = 1 - r

**Comparison Table**

| p value | Error r | Fidelity |
|---------|---------|----------|
| 0.999   | 0.05%   | 99.95%   |
| 0.99    | 0.5%    | 99.5%    |
| 0.95    | 2.5%    | 97.5%    |
| 0.90    | 5%      | 95%      |

**Context for Your Results**

- IBM/Google targets: ~99.9% single-qubit
- Ion traps: ~99.99% achievable
- Your simulation: Depends on noise model

**Limitations of RB**

1. Averages over gate set (may miss individual bad gates)
2. Assumes Markovian noise
3. Measures average, not worst-case

**Going Further**
- Interleaved RB for specific gate fidelity
- 2-qubit RB for entangling gate fidelity
- Compare to process tomography`,
      },
    ],
  },
];

export const getExperimentById = (id: string): ExperimentTemplate | undefined => {
  return experimentTemplates.find((exp) => exp.id === id);
};

export const getExperimentsByDifficulty = (difficulty: ExperimentDifficulty): ExperimentTemplate[] => {
  return experimentTemplates.filter((exp) => exp.difficulty === difficulty);
};

export const getDRIFTExperiments = (): ExperimentTemplate[] => {
  return experimentTemplates.filter((exp) => exp.driftFocus);
};
