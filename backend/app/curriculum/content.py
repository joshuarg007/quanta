"""Lesson content for QUANTA curriculum."""

# Import modular lessons
from .lessons.qubits import LESSON_CONTENT as QUBITS_LESSON
from .lessons.superposition import LESSON_CONTENT as SUPERPOSITION_LESSON

# Build the content dictionary
# Enhanced lessons override the basic ones
LESSON_CONTENT = {
    # Use the enhanced qubits lesson
    "qubits": QUBITS_LESSON,

    # Use the enhanced superposition lesson
    "superposition": SUPERPOSITION_LESSON,

    # ============================================================
    # FUNDAMENTALS TRACK (other lessons)
    # ============================================================
    "qubits_basic": {  # Keep basic version as backup
        "id": "qubits",
        "title": "What is a Qubit?",
        "track": "fundamentals",
        "sections": [
            {
                "type": "text",
                "content": {
                    "title": "Classical Bits vs Quantum Bits",
                    "body": """In classical computing, information is stored in **bits** — tiny switches that are either OFF (0) or ON (1). Every program, image, and video on your computer is ultimately just a long sequence of 0s and 1s.

A **qubit** (quantum bit) is the quantum version of a classical bit. But here's what makes it special: while a classical bit must be either 0 or 1, a qubit can exist in a **superposition** of both states simultaneously.

Think of it this way:
- **Classical bit**: A coin lying on a table — either heads OR tails
- **Qubit**: A coin spinning in the air — in some sense both heads AND tails until it lands"""
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "The Mathematics of Qubits",
                    "body": """We represent qubit states using **Dirac notation** (also called bra-ket notation):

- **|0⟩** represents the "zero" state
- **|1⟩** represents the "one" state

A general qubit state is written as:

**|ψ⟩ = α|0⟩ + β|1⟩**

Where α and β are complex numbers called **amplitudes** that satisfy:

**|α|² + |β|² = 1**

The probability of measuring 0 is |α|², and the probability of measuring 1 is |β|²."""
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "The Bloch Sphere",
                    "body": """We can visualize a single qubit's state as a point on a sphere called the **Bloch sphere**:

- The **north pole** represents |0⟩
- The **south pole** represents |1⟩
- Points on the **equator** represent equal superpositions of |0⟩ and |1⟩

Every single-qubit state corresponds to a unique point on this sphere. Quantum gates are rotations on this sphere!"""
                }
            },
            {
                "type": "circuit",
                "content": {
                    "title": "Your First Qubit",
                    "description": "This is a single qubit initialized to |0⟩. Run the simulation to see the measurement results.",
                    "template": {
                        "numQubits": 1,
                        "gates": []
                    },
                    "expectedOutput": "The qubit starts in |0⟩, so measuring it will always give 0."
                }
            },
            {
                "type": "exercise",
                "content": {
                    "title": "Try It Yourself",
                    "description": "Add an X gate to your qubit. What happens to the state?",
                    "hint": "The X gate is like a classical NOT gate — it flips |0⟩ to |1⟩ and vice versa.",
                    "template": {
                        "numQubits": 1,
                        "gates": []
                    },
                    "solution": {
                        "numQubits": 1,
                        "gates": [{"type": "X", "qubit": 0, "step": 0}]
                    }
                }
            },
            {
                "type": "quiz",
                "content": {
                    "question": "If a qubit is in state |ψ⟩ = (1/√2)|0⟩ + (1/√2)|1⟩, what is the probability of measuring 1?",
                    "options": ["0%", "25%", "50%", "100%"],
                    "correctIndex": 2,
                    "explanation": "The probability is |1/√2|² = 1/2 = 50%"
                }
            }
        ]
    },


    "measurement": {
        "id": "measurement",
        "title": "Measurement",
        "track": "fundamentals",
        "sections": [
            {
                "type": "text",
                "content": {
                    "title": "Quantum Measurement",
                    "body": """When we **measure** a qubit, something strange happens: the superposition **collapses** to a single definite state.

If a qubit is in state |ψ⟩ = α|0⟩ + β|1⟩:
- We measure **0** with probability |α|²
- We measure **1** with probability |β|²

After measurement, the qubit is left in the state we measured. The superposition is destroyed — this is irreversible!

This is why quantum algorithms must be carefully designed to extract useful information through measurement."""
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "The Measurement Problem",
                    "body": """Measurement in quantum mechanics is genuinely mysterious. Key points:

1. **Measurement is probabilistic** — we can only predict probabilities, not definite outcomes
2. **Measurement changes the state** — observing a quantum system disturbs it
3. **The timing matters** — measuring too early destroys useful superposition

This is why quantum circuits are designed to delay measurement until the very end, after all the quantum operations have extracted the answer through interference."""
                }
            },
            {
                "type": "circuit",
                "content": {
                    "title": "Observing Measurement",
                    "description": "This circuit puts a qubit in superposition, then measures it. Run it many times!",
                    "template": {
                        "numQubits": 1,
                        "gates": [
                            {"type": "H", "qubit": 0, "step": 0},
                            {"type": "MEASURE", "qubit": 0, "step": 1}
                        ]
                    },
                    "expectedOutput": "Each run will give either 0 or 1 with equal probability."
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "Statistical Results",
                    "body": """Because measurement is probabilistic, we usually run quantum circuits many times (called **shots**) to build up statistics.

In QUANTA's simulator:
- Default is 1024 shots
- Results show the distribution of outcomes
- More shots = more accurate probability estimates

Real quantum computers also run multiple shots, with added noise from imperfect hardware."""
                }
            },
            {
                "type": "exercise",
                "content": {
                    "title": "Biased Measurement",
                    "description": "Can you create a state that measures 1 more often than 0? Try using rotation gates!",
                    "hint": "The RY gate rotates toward |1⟩. Try RY(π/3) or RY(2π/3).",
                    "template": {
                        "numQubits": 1,
                        "gates": []
                    },
                    "solution": {
                        "numQubits": 1,
                        "gates": [{"type": "RY", "qubit": 0, "step": 0, "parameter": 2.094}]
                    }
                }
            },
            {
                "type": "quiz",
                "content": {
                    "question": "After measuring a qubit in superposition and getting 0, what state is the qubit in?",
                    "options": [
                        "Still in superposition",
                        "|0⟩",
                        "|1⟩",
                        "The qubit is destroyed"
                    ],
                    "correctIndex": 1,
                    "explanation": "Measurement collapses the state. Getting 0 means the qubit is now in |0⟩."
                }
            }
        ]
    },

    "entanglement": {
        "id": "entanglement",
        "title": "Entanglement",
        "track": "fundamentals",
        "sections": [
            {
                "type": "text",
                "content": {
                    "title": "Spooky Action at a Distance",
                    "body": """**Entanglement** is a uniquely quantum phenomenon where two or more qubits become correlated in ways that have no classical explanation.

When qubits are entangled, measuring one qubit instantly affects what we'll measure on the other — even if they're on opposite sides of the universe! Einstein famously called this "spooky action at a distance."

Important: This doesn't allow faster-than-light communication. The correlations only become apparent when comparing results."""
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "The Bell State",
                    "body": """The simplest and most famous entangled state is the **Bell state** (or EPR pair):

**|Φ+⟩ = (1/√2)|00⟩ + (1/√2)|11⟩**

This state has remarkable properties:
- Each qubit individually looks random (50/50)
- But they're perfectly correlated: measure one as 0, the other MUST be 0
- This correlation exists no matter how far apart the qubits are

Creating a Bell state requires two gates:
1. **Hadamard (H)** on the first qubit
2. **CNOT** with first qubit as control, second as target"""
                }
            },
            {
                "type": "circuit",
                "content": {
                    "title": "Creating Entanglement",
                    "description": "This circuit creates a Bell state — the simplest entangled state.",
                    "template": {
                        "numQubits": 2,
                        "gates": [
                            {"type": "H", "qubit": 0, "step": 0},
                            {"type": "CNOT", "qubit": 1, "controlQubit": 0, "step": 1}
                        ]
                    },
                    "expectedOutput": "You should only ever measure 00 or 11 — never 01 or 10!"
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "Why Entanglement Matters",
                    "body": """Entanglement is essential for:

1. **Quantum algorithms** — Grover's, Shor's, and others require entanglement
2. **Quantum teleportation** — Transfer quantum states using entanglement
3. **Quantum cryptography** — Detect eavesdroppers using entangled pairs
4. **Quantum error correction** — Protect quantum information

Without entanglement, quantum computers would be no more powerful than classical probabilistic computers!"""
                }
            },
            {
                "type": "exercise",
                "content": {
                    "title": "Other Bell States",
                    "description": "Create the |Ψ+⟩ Bell state: (1/√2)|01⟩ + (1/√2)|10⟩. Hint: apply X to one qubit!",
                    "hint": "Start with |Φ+⟩ (H then CNOT), then flip one qubit with X.",
                    "template": {
                        "numQubits": 2,
                        "gates": []
                    },
                    "solution": {
                        "numQubits": 2,
                        "gates": [
                            {"type": "H", "qubit": 0, "step": 0},
                            {"type": "CNOT", "qubit": 1, "controlQubit": 0, "step": 1},
                            {"type": "X", "qubit": 0, "step": 2}
                        ]
                    }
                }
            },
            {
                "type": "quiz",
                "content": {
                    "question": "In a Bell state |Φ+⟩, if Alice measures her qubit and gets 1, what will Bob measure?",
                    "options": ["Always 0", "Always 1", "50% chance of 0 or 1", "It depends on when he measures"],
                    "correctIndex": 1,
                    "explanation": "In |Φ+⟩ = (|00⟩ + |11⟩)/√2, the qubits are perfectly correlated. If one is 1, the other must be 1."
                }
            }
        ]
    },

    # ============================================================
    # GATES TRACK
    # ============================================================
    "pauli-gates": {
        "id": "pauli-gates",
        "title": "Pauli Gates (X, Y, Z)",
        "track": "gates",
        "sections": [
            {
                "type": "text",
                "content": {
                    "title": "The Pauli Matrices",
                    "body": """The **Pauli gates** are three fundamental single-qubit operations, each corresponding to a 180° rotation around one axis of the Bloch sphere:

- **X gate (Pauli-X)**: Rotation around X-axis — like a classical NOT gate
- **Y gate (Pauli-Y)**: Rotation around Y-axis
- **Z gate (Pauli-Z)**: Rotation around Z-axis — flips the phase

These gates are their own inverses: applying any Pauli gate twice returns to the original state."""
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "The X Gate (NOT Gate)",
                    "body": """The **X gate** is the quantum equivalent of a classical NOT gate:

- **X|0⟩ = |1⟩**
- **X|1⟩ = |0⟩**

On the Bloch sphere, it's a 180° rotation around the X-axis, which swaps the north and south poles.

Matrix form:
```
X = [0  1]
    [1  0]
```"""
                }
            },
            {
                "type": "circuit",
                "content": {
                    "title": "The X Gate in Action",
                    "description": "The X gate flips |0⟩ to |1⟩. Try it!",
                    "template": {
                        "numQubits": 1,
                        "gates": [{"type": "X", "qubit": 0, "step": 0}]
                    },
                    "expectedOutput": "You should always measure 1."
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "The Z Gate (Phase Flip)",
                    "body": """The **Z gate** leaves |0⟩ unchanged but flips the sign of |1⟩:

- **Z|0⟩ = |0⟩**
- **Z|1⟩ = -|1⟩**

This doesn't change measurement probabilities for a computational basis state, but it matters for interference!

On the Bloch sphere, it's a 180° rotation around the Z-axis."""
                }
            },
            {
                "type": "circuit",
                "content": {
                    "title": "Z Gate and Phase",
                    "description": "Z on |0⟩ does nothing visible. But apply H, then Z, then H — what happens?",
                    "template": {
                        "numQubits": 1,
                        "gates": [
                            {"type": "H", "qubit": 0, "step": 0},
                            {"type": "Z", "qubit": 0, "step": 1},
                            {"type": "H", "qubit": 0, "step": 2}
                        ]
                    },
                    "expectedOutput": "HZH = X! You should always measure 1."
                }
            },
            {
                "type": "exercise",
                "content": {
                    "title": "Pauli Identities",
                    "description": "Verify that X·X = I (identity). Build a circuit that applies X twice.",
                    "hint": "If X² = I, then applying X twice should give you back |0⟩.",
                    "template": {
                        "numQubits": 1,
                        "gates": []
                    },
                    "solution": {
                        "numQubits": 1,
                        "gates": [
                            {"type": "X", "qubit": 0, "step": 0},
                            {"type": "X", "qubit": 0, "step": 1}
                        ]
                    }
                }
            },
            {
                "type": "quiz",
                "content": {
                    "question": "What does the Z gate do to the state |+⟩ = (|0⟩ + |1⟩)/√2?",
                    "options": [
                        "Nothing (leaves it unchanged)",
                        "Converts it to |-⟩ = (|0⟩ - |1⟩)/√2",
                        "Converts it to |1⟩",
                        "Converts it to |0⟩"
                    ],
                    "correctIndex": 1,
                    "explanation": "Z flips the phase of |1⟩, so Z|+⟩ = (|0⟩ - |1⟩)/√2 = |-⟩"
                }
            }
        ]
    },

    "hadamard": {
        "id": "hadamard",
        "title": "The Hadamard Gate",
        "track": "gates",
        "sections": [
            {
                "type": "text",
                "content": {
                    "title": "The Most Important Gate",
                    "body": """The **Hadamard gate (H)** is arguably the most important single-qubit gate in quantum computing. It creates superposition from computational basis states:

- **H|0⟩ = |+⟩ = (|0⟩ + |1⟩)/√2**
- **H|1⟩ = |-⟩ = (|0⟩ - |1⟩)/√2**

And converts superposition back to computational basis:
- **H|+⟩ = |0⟩**
- **H|-⟩ = |1⟩**

The Hadamard is its own inverse: **H² = I**"""
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "Hadamard as a Rotation",
                    "body": """On the Bloch sphere, H is a 180° rotation around the axis that's 45° between X and Z.

This swaps:
- X-axis ↔ Z-axis
- |0⟩ ↔ |+⟩
- |1⟩ ↔ |-⟩

Matrix form:
```
H = (1/√2) [1   1]
           [1  -1]
```"""
                }
            },
            {
                "type": "circuit",
                "content": {
                    "title": "Superposition with Hadamard",
                    "description": "Apply H to create a 50/50 superposition.",
                    "template": {
                        "numQubits": 1,
                        "gates": [{"type": "H", "qubit": 0, "step": 0}]
                    },
                    "expectedOutput": "~50% |0⟩ and ~50% |1⟩"
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "Hadamard in Algorithms",
                    "body": """Almost every quantum algorithm starts by applying H to all qubits. This creates an **equal superposition of all possible inputs**:

For n qubits: H⊗n|0...0⟩ = (1/√2ⁿ) Σ|x⟩

This allows the algorithm to process all inputs simultaneously through quantum parallelism. The trick is then using interference to amplify the correct answer."""
                }
            },
            {
                "type": "exercise",
                "content": {
                    "title": "Uniform Superposition",
                    "description": "Create a uniform superposition over all 3-qubit states (8 possibilities).",
                    "hint": "Apply H to each qubit. All 8 outcomes (000 through 111) should be equally likely.",
                    "template": {
                        "numQubits": 3,
                        "gates": []
                    },
                    "solution": {
                        "numQubits": 3,
                        "gates": [
                            {"type": "H", "qubit": 0, "step": 0},
                            {"type": "H", "qubit": 1, "step": 0},
                            {"type": "H", "qubit": 2, "step": 0}
                        ]
                    }
                }
            },
            {
                "type": "quiz",
                "content": {
                    "question": "What is H·Z·H equal to?",
                    "options": ["I (identity)", "X", "Y", "Z"],
                    "correctIndex": 1,
                    "explanation": "H transforms between X and Z bases. HZH = X. Similarly, HXH = Z."
                }
            }
        ]
    },

    "cnot": {
        "id": "cnot",
        "title": "CNOT and Entanglement",
        "track": "gates",
        "sections": [
            {
                "type": "text",
                "content": {
                    "title": "Two-Qubit Gates",
                    "body": """So far we've only seen single-qubit gates. But the real power of quantum computing comes from **two-qubit gates** that create correlations between qubits.

The most important two-qubit gate is the **CNOT (Controlled-NOT)** gate, also called CX. It has:
- A **control qubit** (unchanged by the gate)
- A **target qubit** (flipped if control is |1⟩)"""
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "How CNOT Works",
                    "body": """The CNOT gate performs a conditional operation:
- If control = |0⟩: target unchanged
- If control = |1⟩: target flipped (X applied)

Truth table:
```
|00⟩ → |00⟩  (control=0, no flip)
|01⟩ → |01⟩  (control=0, no flip)
|10⟩ → |11⟩  (control=1, flip!)
|11⟩ → |10⟩  (control=1, flip!)
```

The CNOT is also its own inverse: CNOT² = I"""
                }
            },
            {
                "type": "circuit",
                "content": {
                    "title": "CNOT with |1⟩ Control",
                    "description": "When control is |1⟩, the target gets flipped.",
                    "template": {
                        "numQubits": 2,
                        "gates": [
                            {"type": "X", "qubit": 0, "step": 0},
                            {"type": "CNOT", "qubit": 1, "controlQubit": 0, "step": 1}
                        ]
                    },
                    "expectedOutput": "Result: |11⟩ (both qubits are 1)"
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "CNOT Creates Entanglement",
                    "body": """Here's the magic: when the control qubit is in **superposition**, CNOT creates **entanglement**!

Starting with |0⟩|0⟩:
1. H on first qubit: (|0⟩ + |1⟩)|0⟩/√2 = (|00⟩ + |10⟩)/√2
2. CNOT: (|00⟩ + |11⟩)/√2 = Bell state!

The qubits are now entangled — measuring one instantly determines the other."""
                }
            },
            {
                "type": "circuit",
                "content": {
                    "title": "Creating a Bell State",
                    "description": "H + CNOT = entanglement. You'll only ever see 00 or 11.",
                    "template": {
                        "numQubits": 2,
                        "gates": [
                            {"type": "H", "qubit": 0, "step": 0},
                            {"type": "CNOT", "qubit": 1, "controlQubit": 0, "step": 1}
                        ]
                    },
                    "expectedOutput": "~50% |00⟩ and ~50% |11⟩, never |01⟩ or |10⟩"
                }
            },
            {
                "type": "exercise",
                "content": {
                    "title": "GHZ State",
                    "description": "Create a 3-qubit GHZ state: (|000⟩ + |111⟩)/√2. All three qubits perfectly correlated!",
                    "hint": "Start with H on first qubit, then cascade CNOTs: 0→1, then 1→2",
                    "template": {
                        "numQubits": 3,
                        "gates": []
                    },
                    "solution": {
                        "numQubits": 3,
                        "gates": [
                            {"type": "H", "qubit": 0, "step": 0},
                            {"type": "CNOT", "qubit": 1, "controlQubit": 0, "step": 1},
                            {"type": "CNOT", "qubit": 2, "controlQubit": 1, "step": 2}
                        ]
                    }
                }
            },
            {
                "type": "quiz",
                "content": {
                    "question": "What happens if you apply CNOT to (|0⟩ + |1⟩)|0⟩/√2?",
                    "options": [
                        "(|00⟩ + |10⟩)/√2 (no change)",
                        "(|00⟩ + |01⟩)/√2",
                        "(|00⟩ + |11⟩)/√2 (entangled!)",
                        "|00⟩"
                    ],
                    "correctIndex": 2,
                    "explanation": "CNOT flips target when control is |1⟩. So |10⟩ → |11⟩, giving (|00⟩ + |11⟩)/√2."
                }
            }
        ]
    },

    "rotation-gates": {
        "id": "rotation-gates",
        "title": "Rotation Gates",
        "track": "gates",
        "sections": [
            {
                "type": "text",
                "content": {
                    "title": "Parameterized Rotations",
                    "body": """The Pauli gates (X, Y, Z) are 180° rotations. But what if we want to rotate by other angles?

The **rotation gates** RX, RY, and RZ let us rotate by any angle θ:

- **RX(θ)**: Rotation by θ around X-axis
- **RY(θ)**: Rotation by θ around Y-axis
- **RZ(θ)**: Rotation by θ around Z-axis

Special cases:
- RX(π) = X (up to global phase)
- RY(π) = Y
- RZ(π) = Z"""
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "RY for Amplitude Control",
                    "body": """The RY gate is particularly useful because it changes the **amplitudes** of |0⟩ and |1⟩:

**RY(θ)|0⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩**

This lets you create any superposition with real amplitudes:
- RY(0) = |0⟩ (100% probability of 0)
- RY(π/2) = |+⟩ (50/50, like Hadamard)
- RY(π) = |1⟩ (100% probability of 1)"""
                }
            },
            {
                "type": "circuit",
                "content": {
                    "title": "Biased Superposition",
                    "description": "RY(π/3) creates a state with 75% probability of |0⟩, 25% probability of |1⟩.",
                    "template": {
                        "numQubits": 1,
                        "gates": [{"type": "RY", "qubit": 0, "step": 0, "parameter": 1.047}]
                    },
                    "expectedOutput": "~75% |0⟩, ~25% |1⟩"
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "RZ for Phase Control",
                    "body": """RZ changes the **phase** without changing measurement probabilities (in computational basis):

**RZ(φ)|0⟩ = |0⟩**
**RZ(φ)|1⟩ = e^(iφ)|1⟩**

Phase matters for interference! The S and T gates are special RZ rotations:
- **S = RZ(π/2)**
- **T = RZ(π/4)**"""
                }
            },
            {
                "type": "exercise",
                "content": {
                    "title": "Custom Superposition",
                    "description": "Create a state with approximately 90% probability of measuring |0⟩.",
                    "hint": "Use RY(θ) where cos²(θ/2) ≈ 0.9. That's θ ≈ 0.64 radians.",
                    "template": {
                        "numQubits": 1,
                        "gates": []
                    },
                    "solution": {
                        "numQubits": 1,
                        "gates": [{"type": "RY", "qubit": 0, "step": 0, "parameter": 0.6435}]
                    }
                }
            },
            {
                "type": "quiz",
                "content": {
                    "question": "What rotation does RY(π) perform?",
                    "options": [
                        "No rotation (identity)",
                        "Same as X gate",
                        "Same as Z gate",
                        "Same as H gate"
                    ],
                    "correctIndex": 1,
                    "explanation": "RY(π)|0⟩ = cos(π/2)|0⟩ + sin(π/2)|1⟩ = |1⟩, just like X gate."
                }
            }
        ]
    },

    # ============================================================
    # ALGORITHMS TRACK
    # ============================================================
    "deutsch-jozsa": {
        "id": "deutsch-jozsa",
        "title": "Deutsch-Jozsa Algorithm",
        "track": "algorithms",
        "sections": [
            {
                "type": "text",
                "content": {
                    "title": "Your First Quantum Speedup",
                    "body": """The **Deutsch-Jozsa algorithm** was the first to demonstrate that quantum computers can solve certain problems exponentially faster than classical computers.

**The Problem:**
You're given a black-box function f(x) that takes n-bit inputs and outputs 0 or 1. You're promised that f is either:
- **Constant**: f(x) = 0 for all x, OR f(x) = 1 for all x
- **Balanced**: f(x) = 0 for exactly half the inputs, f(x) = 1 for the other half

Determine which type f is."""
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "Classical vs Quantum",
                    "body": """**Classical approach:**
In the worst case, you need to check 2^(n-1) + 1 inputs. For n=100 bits, that's more queries than atoms in the universe!

**Quantum approach:**
The Deutsch-Jozsa algorithm determines the answer with just **ONE** query to f, regardless of n!

This exponential speedup comes from quantum parallelism and interference."""
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "The Algorithm",
                    "body": """**Steps:**
1. Initialize n input qubits to |0⟩ and 1 output qubit to |1⟩
2. Apply H to all qubits (creates superposition)
3. Apply the oracle Uf (implements the function)
4. Apply H to the input qubits
5. Measure the input qubits

**Result interpretation:**
- If all input qubits measure 0: f is **constant**
- If any input qubit measures 1: f is **balanced**"""
                }
            },
            {
                "type": "circuit",
                "content": {
                    "title": "Deutsch-Jozsa (2 qubits)",
                    "description": "A simple example with n=1 and a balanced function (XOR with constant).",
                    "template": {
                        "numQubits": 2,
                        "gates": [
                            {"type": "X", "qubit": 1, "step": 0},
                            {"type": "H", "qubit": 0, "step": 1},
                            {"type": "H", "qubit": 1, "step": 1},
                            {"type": "CNOT", "qubit": 1, "controlQubit": 0, "step": 2},
                            {"type": "H", "qubit": 0, "step": 3}
                        ]
                    },
                    "expectedOutput": "Qubit 0 = 1, indicating the function is balanced."
                }
            },
            {
                "type": "exercise",
                "content": {
                    "title": "Constant Function",
                    "description": "Modify the circuit to test a constant function (remove the CNOT oracle). What do you measure?",
                    "hint": "Without the CNOT, the function always outputs the same value. The input qubit should measure 0.",
                    "template": {
                        "numQubits": 2,
                        "gates": [
                            {"type": "X", "qubit": 1, "step": 0},
                            {"type": "H", "qubit": 0, "step": 1},
                            {"type": "H", "qubit": 1, "step": 1}
                        ]
                    },
                    "solution": {
                        "numQubits": 2,
                        "gates": [
                            {"type": "X", "qubit": 1, "step": 0},
                            {"type": "H", "qubit": 0, "step": 1},
                            {"type": "H", "qubit": 1, "step": 1},
                            {"type": "H", "qubit": 0, "step": 2}
                        ]
                    }
                }
            },
            {
                "type": "quiz",
                "content": {
                    "question": "For a 10-qubit Deutsch-Jozsa problem, how many queries does the quantum algorithm need?",
                    "options": ["1", "10", "512", "1024"],
                    "correctIndex": 0,
                    "explanation": "The quantum algorithm always needs exactly 1 query, regardless of the number of input bits!"
                }
            }
        ]
    },

    "grover": {
        "id": "grover",
        "title": "Grover's Search Algorithm",
        "track": "algorithms",
        "sections": [
            {
                "type": "text",
                "content": {
                    "title": "Quantum Search",
                    "body": """**Grover's algorithm** provides a quadratic speedup for searching an unsorted database.

**The Problem:**
Given a black-box function that marks one special item among N items, find that item.

**Classical:** Check items one by one → O(N) queries
**Quantum:** Grover's algorithm → O(√N) queries

For N = 1,000,000 items:
- Classical: ~1,000,000 queries
- Quantum: ~1,000 queries"""
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "The Key Idea: Amplitude Amplification",
                    "body": """Grover's algorithm uses **amplitude amplification**:

1. Start with equal superposition (all items equally likely)
2. Repeat ~√N times:
   - **Oracle**: Mark the target by flipping its amplitude sign
   - **Diffusion**: Invert amplitudes about the mean

Each iteration increases the target's amplitude while decreasing others. After √N iterations, measuring gives the target with high probability!"""
                }
            },
            {
                "type": "text",
                "content": {
                    "title": "The Grover Iteration",
                    "body": """One Grover iteration consists of:

1. **Oracle (Uf)**: Flip sign of target state
   - |target⟩ → -|target⟩
   - All other states unchanged

2. **Diffusion (Us)**: Reflect about the average
   - Us = 2|s⟩⟨s| - I, where |s⟩ is equal superposition
   - Implemented as: H⊗n · (2|0⟩⟨0| - I) · H⊗n"""
                }
            },
            {
                "type": "circuit",
                "content": {
                    "title": "Grover for 2 Qubits",
                    "description": "Search for |11⟩ among 4 states. One iteration is enough!",
                    "template": {
                        "numQubits": 2,
                        "gates": [
                            {"type": "H", "qubit": 0, "step": 0},
                            {"type": "H", "qubit": 1, "step": 0},
                            {"type": "CZ", "qubit": 1, "controlQubit": 0, "step": 1},
                            {"type": "H", "qubit": 0, "step": 2},
                            {"type": "H", "qubit": 1, "step": 2},
                            {"type": "X", "qubit": 0, "step": 3},
                            {"type": "X", "qubit": 1, "step": 3},
                            {"type": "CZ", "qubit": 1, "controlQubit": 0, "step": 4},
                            {"type": "X", "qubit": 0, "step": 5},
                            {"type": "X", "qubit": 1, "step": 5},
                            {"type": "H", "qubit": 0, "step": 6},
                            {"type": "H", "qubit": 1, "step": 6}
                        ]
                    },
                    "expectedOutput": "|11⟩ with 100% probability!"
                }
            },
            {
                "type": "exercise",
                "content": {
                    "title": "Search for a Different Target",
                    "description": "Modify the oracle to search for |01⟩ instead of |11⟩.",
                    "hint": "The oracle should flip the phase of |01⟩. Use X gates to convert |01⟩ ↔ |11⟩ before and after CZ.",
                    "template": {
                        "numQubits": 2,
                        "gates": [
                            {"type": "H", "qubit": 0, "step": 0},
                            {"type": "H", "qubit": 1, "step": 0}
                        ]
                    },
                    "solution": {
                        "numQubits": 2,
                        "gates": [
                            {"type": "H", "qubit": 0, "step": 0},
                            {"type": "H", "qubit": 1, "step": 0},
                            {"type": "X", "qubit": 0, "step": 1},
                            {"type": "CZ", "qubit": 1, "controlQubit": 0, "step": 2},
                            {"type": "X", "qubit": 0, "step": 3},
                            {"type": "H", "qubit": 0, "step": 4},
                            {"type": "H", "qubit": 1, "step": 4},
                            {"type": "X", "qubit": 0, "step": 5},
                            {"type": "X", "qubit": 1, "step": 5},
                            {"type": "CZ", "qubit": 1, "controlQubit": 0, "step": 6},
                            {"type": "X", "qubit": 0, "step": 7},
                            {"type": "X", "qubit": 1, "step": 7},
                            {"type": "H", "qubit": 0, "step": 8},
                            {"type": "H", "qubit": 1, "step": 8}
                        ]
                    }
                }
            },
            {
                "type": "quiz",
                "content": {
                    "question": "How many Grover iterations are optimal for searching among 1024 items?",
                    "options": ["1", "~25", "~32", "1024"],
                    "correctIndex": 1,
                    "explanation": "Optimal iterations ≈ (π/4)√N ≈ (π/4)√1024 ≈ 25. More iterations actually decrease success probability!"
                }
            }
        ]
    }
}


def get_lesson_content(lesson_id: str):
    """Get full lesson content by ID."""
    return LESSON_CONTENT.get(lesson_id)


def get_all_lessons_metadata():
    """Get metadata for all lessons (without full content)."""
    return [
        {
            "id": lesson_id,
            "title": content["title"],
            "track": content["track"],
            "sectionCount": len(content["sections"])
        }
        for lesson_id, content in LESSON_CONTENT.items()
    ]
