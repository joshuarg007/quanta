"""
Lesson: What is a Qubit?
Track: Fundamentals
Difficulty: Beginner
Duration: 15 minutes

This is a template lesson demonstrating all available section types
and interactive features. Use this as a model for creating new lessons.
"""

LESSON_META = {
    "id": "qubits",
    "title": "What is a Qubit?",
    "track": "fundamentals",
    "description": "Understanding the quantum bit - the fundamental unit of quantum information",
    "difficulty": "beginner",
    "duration": 15,
    "prerequisites": [],
    "objectives": [
        "Understand the difference between classical bits and qubits",
        "Learn how qubits can exist in superposition",
        "Visualize qubit states on the Bloch sphere",
        "Build and simulate your first quantum circuit"
    ],
    "tags": ["fundamentals", "qubit", "superposition", "bloch-sphere"]
}

LESSON_CONTENT = {
    "id": "qubits",
    "title": "What is a Qubit?",
    "track": "fundamentals",
    "sections": [
        # ============================================================
        # SECTION 1: Introduction / Hook
        # ============================================================
        {
            "type": "hero",
            "content": {
                "title": "What is a Qubit?",
                "subtitle": "The Building Block of Quantum Computing",
                "description": "In this lesson, you'll discover the fundamental unit of quantum information — the qubit — and learn why it's so much more powerful than a classical bit.",
                "image": "qubit-hero",
                "duration": 15,
                "objectives": [
                    "Understand classical bits vs qubits",
                    "Learn about superposition",
                    "Visualize states on the Bloch sphere",
                    "Build your first quantum circuit"
                ]
            }
        },

        # ============================================================
        # SECTION 2: Classical Bits Review
        # ============================================================
        {
            "type": "text",
            "content": {
                "title": "Classical Bits: The Foundation",
                "body": """Before we dive into qubits, let's review what you already know about classical computing.

Every computer you've ever used — your phone, laptop, even supercomputers — processes information using **bits**. A bit is the simplest possible unit of information: it can be either **0** or **1**.

Think of a bit like a light switch:
- **OFF** = 0
- **ON** = 1

That's it. No in-between. No "sort of on." Just 0 or 1.

Everything your computer does — displaying this text, playing music, running games — is ultimately just manipulating billions of these simple switches, flipping them between 0 and 1 according to precise rules."""
            }
        },

        {
            "type": "callout",
            "content": {
                "variant": "info",
                "title": "Fun Fact",
                "body": "Your smartphone has about 4-6 billion transistors, each acting like a tiny switch. That's more switches than there are people on Earth!"
            }
        },

        # ============================================================
        # SECTION 3: The Quantum Leap
        # ============================================================
        {
            "type": "text",
            "content": {
                "title": "Enter the Qubit",
                "body": """A **qubit** (quantum bit) is the quantum version of a classical bit. But here's where things get weird and wonderful:

While a classical bit must be either 0 OR 1, a qubit can be in a **superposition** of both states simultaneously.

Imagine that light switch again. In the classical world, it's either off or on. But a quantum light switch could be in a state that's *both* off AND on at the same time — until you look at it.

This isn't just a limitation of our knowledge. The qubit genuinely exists in both states simultaneously. This is the key insight that makes quantum computing powerful."""
            }
        },

        {
            "type": "comparison",
            "content": {
                "title": "Classical Bit vs Qubit",
                "left": {
                    "title": "Classical Bit",
                    "items": [
                        "Either 0 OR 1",
                        "Definite state",
                        "Like a coin on a table",
                        "Read it anytime, same answer",
                        "Copied perfectly"
                    ]
                },
                "right": {
                    "title": "Qubit",
                    "items": [
                        "0 AND 1 simultaneously",
                        "Superposition of states",
                        "Like a spinning coin",
                        "Measurement changes the state",
                        "Cannot be copied (no-cloning theorem)"
                    ]
                }
            }
        },

        # ============================================================
        # SECTION 4: Mathematical Representation
        # ============================================================
        {
            "type": "text",
            "content": {
                "title": "How We Write Qubit States",
                "body": """Physicists use a special notation called **Dirac notation** (or bra-ket notation) to describe quantum states:

- **|0⟩** (pronounced "ket zero") represents the 0 state
- **|1⟩** (pronounced "ket one") represents the 1 state

A general qubit state is written as:

**|ψ⟩ = α|0⟩ + β|1⟩**

Where:
- **ψ** (psi) is just a name for our state
- **α** (alpha) and **β** (beta) are complex numbers called **amplitudes**
- The amplitudes tell us the "weight" of each component"""
            }
        },

        {
            "type": "callout",
            "content": {
                "variant": "warning",
                "title": "Important Rule",
                "body": "The amplitudes must satisfy: |α|² + |β|² = 1. This is called the **normalization condition** and ensures probabilities add up to 100%."
            }
        },

        {
            "type": "math",
            "content": {
                "title": "The Born Rule",
                "description": "When we measure a qubit in state |ψ⟩ = α|0⟩ + β|1⟩:",
                "equations": [
                    {
                        "label": "Probability of measuring 0",
                        "latex": "P(0) = |\\alpha|^2"
                    },
                    {
                        "label": "Probability of measuring 1",
                        "latex": "P(1) = |\\beta|^2"
                    },
                    {
                        "label": "Normalization",
                        "latex": "|\\alpha|^2 + |\\beta|^2 = 1"
                    }
                ]
            }
        },

        # ============================================================
        # SECTION 5: Interactive - Your First Qubit
        # ============================================================
        {
            "type": "circuit",
            "content": {
                "title": "Your First Qubit",
                "description": "Here's a single qubit, initialized to the |0⟩ state. This is the starting point for all quantum computations. Click **Run Circuit** to simulate it!",
                "template": {
                    "numQubits": 1,
                    "gates": []
                },
                "expectedOutput": "Since the qubit starts in |0⟩ with no gates applied, you'll measure 0 with 100% probability.",
                "hints": [
                    "All qubits start in the |0⟩ state by default",
                    "With no gates, the qubit stays in |0⟩",
                    "The result shows 1024 shots, all measuring 0"
                ]
            }
        },

        # ============================================================
        # SECTION 6: The Bloch Sphere
        # ============================================================
        {
            "type": "text",
            "content": {
                "title": "Visualizing Qubits: The Bloch Sphere",
                "body": """How do we visualize something that can be in two states at once? Enter the **Bloch sphere** — a beautiful geometric representation of a qubit's state.

The Bloch sphere is a unit sphere where:
- The **north pole** represents |0⟩
- The **south pole** represents |1⟩
- Points on the **equator** represent equal superpositions
- Every point on the surface represents a valid qubit state

The angles θ (theta) and φ (phi) precisely specify any qubit state:

**|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩**"""
            }
        },

        {
            "type": "bloch",
            "content": {
                "title": "Interactive Bloch Sphere",
                "description": "This sphere represents all possible states of a single qubit. The current state is shown as an arrow (state vector).",
                "initialState": {"theta": 0, "phi": 0},
                "showControls": True,
                "annotations": [
                    {"position": "north", "label": "|0⟩"},
                    {"position": "south", "label": "|1⟩"},
                    {"position": "east", "label": "|+⟩"},
                    {"position": "west", "label": "|-⟩"}
                ]
            }
        },

        {
            "type": "callout",
            "content": {
                "variant": "tip",
                "title": "Visualization Tip",
                "body": "Quantum gates are simply **rotations** on the Bloch sphere! The X gate rotates 180° around the X-axis, flipping |0⟩ to |1⟩."
            }
        },

        # ============================================================
        # SECTION 7: Exercise - Flip the Qubit
        # ============================================================
        {
            "type": "exercise",
            "content": {
                "title": "Exercise: Flip the Qubit",
                "description": "Your first quantum task! Use the **X gate** (quantum NOT gate) to flip the qubit from |0⟩ to |1⟩.",
                "difficulty": "easy",
                "objectives": [
                    "Add an X gate to the circuit",
                    "Run the simulation",
                    "Verify the qubit is now in |1⟩"
                ],
                "template": {
                    "numQubits": 1,
                    "gates": []
                },
                "solution": {
                    "numQubits": 1,
                    "gates": [{"type": "X", "qubit": 0, "step": 0}]
                },
                "validation": {
                    "expectedStates": ["1"],
                    "minProbability": 0.99
                },
                "hints": [
                    "The X gate is like a classical NOT gate",
                    "Find the X gate in the 'Single Qubit' section of the gate palette",
                    "Drag it onto qubit 0 at step 0"
                ],
                "successMessage": "Excellent! You've performed your first quantum operation. The X gate flipped |0⟩ to |1⟩!",
                "failureMessage": "Not quite. Make sure you've added exactly one X gate to the circuit."
            }
        },

        # ============================================================
        # SECTION 8: Code Example
        # ============================================================
        {
            "type": "code",
            "content": {
                "title": "In Qiskit",
                "description": "Here's how you would create and measure a qubit in real quantum code using Qiskit:",
                "language": "python",
                "code": """from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

# Create a quantum circuit with 1 qubit
qc = QuantumCircuit(1, 1)

# Apply X gate (flip the qubit)
qc.x(0)

# Measure the qubit
qc.measure(0, 0)

# Simulate
simulator = AerSimulator()
job = simulator.run(transpile(qc, simulator), shots=1024)
result = job.result()
counts = result.get_counts()

print(counts)  # Output: {'1': 1024}""",
                "output": "{'1': 1024}",
                "explanation": "This code creates a circuit, applies an X gate, and measures. All 1024 shots give '1' because X flips |0⟩ to |1⟩."
            }
        },

        # ============================================================
        # SECTION 9: Creating Superposition
        # ============================================================
        {
            "type": "text",
            "content": {
                "title": "Creating Superposition",
                "body": """Now for the quantum magic! The **Hadamard gate (H)** creates superposition from a definite state.

When applied to |0⟩:
**H|0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩**

This state, called |+⟩ (plus), has:
- 50% probability of measuring 0
- 50% probability of measuring 1

The qubit is genuinely in both states until we measure it!"""
            }
        },

        {
            "type": "circuit",
            "content": {
                "title": "Superposition in Action",
                "description": "Watch superposition happen! The H gate puts our qubit into an equal mix of |0⟩ and |1⟩. Run it multiple times!",
                "template": {
                    "numQubits": 1,
                    "gates": [{"type": "H", "qubit": 0, "step": 0}]
                },
                "expectedOutput": "You should see roughly 50% |0⟩ and 50% |1⟩. The exact split varies due to quantum randomness!",
                "interactive": True,
                "showStatevector": True
            }
        },

        # ============================================================
        # SECTION 10: Advanced Exercise
        # ============================================================
        {
            "type": "exercise",
            "content": {
                "title": "Challenge: H-X-H Circuit",
                "description": "Here's a puzzle: What happens if you apply H, then X, then H again? Predict the outcome before running!",
                "difficulty": "medium",
                "objectives": [
                    "Build the H-X-H circuit",
                    "Predict the outcome",
                    "Verify your prediction"
                ],
                "template": {
                    "numQubits": 1,
                    "gates": []
                },
                "solution": {
                    "numQubits": 1,
                    "gates": [
                        {"type": "H", "qubit": 0, "step": 0},
                        {"type": "X", "qubit": 0, "step": 1},
                        {"type": "H", "qubit": 0, "step": 2}
                    ]
                },
                "hints": [
                    "H creates superposition: |0⟩ → |+⟩",
                    "X in the middle flips signs: |+⟩ → |-⟩",
                    "H converts |-⟩ back to a computational basis state",
                    "What's H|-⟩?"
                ],
                "successMessage": "Mind-bending! HXH = Z. The combination is equivalent to a Z gate, which flips |0⟩ to... itself with a phase change. But phases only show up in superposition!",
                "revealAnswer": "HXH|0⟩ = |1⟩. The H-X-H sequence equals Z gate, and Z on the computational basis acts like... actually, let's verify: H|0⟩=|+⟩, X|+⟩=|+⟩ (X doesn't change |+⟩!), H|+⟩=|0⟩. Wait — the answer is |0⟩! X doesn't affect |+⟩ because |+⟩ is an eigenvector of X."
            }
        },

        # ============================================================
        # SECTION 11: Quiz
        # ============================================================
        {
            "type": "quiz",
            "content": {
                "title": "Knowledge Check",
                "questions": [
                    {
                        "question": "A qubit in state |ψ⟩ = (1/√2)|0⟩ + (1/√2)|1⟩ is measured. What's the probability of getting 1?",
                        "options": ["0%", "25%", "50%", "100%"],
                        "correctIndex": 2,
                        "explanation": "The probability is |1/√2|² = 1/2 = 50%. This is the |+⟩ state, an equal superposition."
                    },
                    {
                        "question": "Which gate creates superposition from |0⟩?",
                        "options": ["X gate", "Z gate", "H gate", "I gate"],
                        "correctIndex": 2,
                        "explanation": "The Hadamard (H) gate transforms |0⟩ into (|0⟩+|1⟩)/√2, creating equal superposition."
                    },
                    {
                        "question": "On the Bloch sphere, where is the |1⟩ state?",
                        "options": ["North pole", "South pole", "On the equator", "Inside the sphere"],
                        "correctIndex": 1,
                        "explanation": "|0⟩ is at the north pole, |1⟩ is at the south pole. The equator contains superposition states like |+⟩ and |-⟩."
                    },
                    {
                        "question": "What happens when you apply X gate twice (X·X)?",
                        "options": [
                            "The qubit is destroyed",
                            "You get back to the original state",
                            "The qubit enters superposition",
                            "Nothing, X can only be applied once"
                        ],
                        "correctIndex": 1,
                        "explanation": "X·X = I (identity). Applying X twice returns the qubit to its original state. X is its own inverse!"
                    }
                ]
            }
        },

        # ============================================================
        # SECTION 12: Summary
        # ============================================================
        {
            "type": "summary",
            "content": {
                "title": "Key Takeaways",
                "points": [
                    {
                        "title": "Qubits vs Bits",
                        "description": "Classical bits are 0 OR 1. Qubits can be 0 AND 1 simultaneously through superposition."
                    },
                    {
                        "title": "Dirac Notation",
                        "description": "We write qubit states as |ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1."
                    },
                    {
                        "title": "The Bloch Sphere",
                        "description": "A sphere where every point represents a valid qubit state. |0⟩ is north, |1⟩ is south."
                    },
                    {
                        "title": "Key Gates",
                        "description": "X gate flips 0↔1. H gate creates superposition. Gates are rotations on the Bloch sphere."
                    },
                    {
                        "title": "Measurement",
                        "description": "Measuring collapses superposition. Probabilities come from the squared amplitudes."
                    }
                ],
                "nextLesson": {
                    "id": "superposition",
                    "title": "Superposition",
                    "description": "Dive deeper into quantum superposition and learn why it's the source of quantum computing's power."
                }
            }
        },

        # ============================================================
        # SECTION 13: Sandbox Prompt
        # ============================================================
        {
            "type": "sandbox",
            "content": {
                "title": "Continue Exploring",
                "description": "Ready to experiment on your own? Open the Sandbox to build custom circuits and explore quantum mechanics hands-on.",
                "suggestedExperiments": [
                    "Try applying H twice (H·H). What happens?",
                    "Build a circuit with X then H. How is it different from H then X?",
                    "Create different superposition states with rotation gates"
                ],
                "preloadCircuit": {
                    "numQubits": 1,
                    "gates": [{"type": "H", "qubit": 0, "step": 0}]
                }
            }
        }
    ]
}


def get_lesson():
    """Return the complete lesson data."""
    return {
        "meta": LESSON_META,
        "content": LESSON_CONTENT
    }
