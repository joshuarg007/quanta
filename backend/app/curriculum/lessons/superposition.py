"""
Lesson 2: Superposition - Deep Dive
Track: Fundamentals
"""

LESSON_META = {
    "id": "superposition",
    "title": "Superposition Deep Dive",
    "track": "fundamentals",
    "difficulty": "beginner",
    "duration": 20,
    "prerequisites": ["qubits"],
    "objectives": [
        "Master the Hadamard gate",
        "Understand probability amplitudes",
        "Create custom superposition states",
        "Learn about quantum interference"
    ],
    "tags": ["superposition", "hadamard", "amplitudes", "interference"]
}

LESSON_CONTENT = {
    "id": "superposition",
    "title": "Superposition Deep Dive",
    "track": "fundamentals",
    "sections": [
        # 1. Hero Section
        {
            "type": "hero",
            "content": {
                "title": "Superposition Deep Dive",
                "subtitle": "The Heart of Quantum Power",
                "description": "Superposition is what makes quantum computers powerful. In this lesson, you'll master creating, manipulating, and understanding superposition states.",
                "image": "superposition-hero",
                "duration": 20,
                "objectives": [
                    "Master the Hadamard gate",
                    "Understand probability amplitudes",
                    "Create custom superposition states",
                    "Discover quantum interference"
                ]
            }
        },

        # 2. Recap
        {
            "type": "text",
            "content": {
                "title": "Quick Recap: What is Superposition?",
                "body": "In the previous lesson, we learned that a qubit can exist in a **superposition** of |0⟩ and |1⟩ simultaneously:\n\n**|ψ⟩ = α|0⟩ + β|1⟩**\n\nBut what does this really mean? And why is it so powerful?\n\nImagine you're searching through a phone book for a specific name. Classically, you check each entry one by one. But with superposition, a quantum computer can effectively check ALL entries at once!\n\nThis lesson will show you exactly how that works."
            }
        },

        # 3. The Hadamard Gate
        {
            "type": "text",
            "content": {
                "title": "The Hadamard Gate: Your Superposition Tool",
                "body": "The **Hadamard gate (H)** is the most important single-qubit gate in quantum computing. It's your primary tool for creating superposition.\n\nWhat H does:\n- Transforms |0⟩ into an equal superposition of |0⟩ and |1⟩\n- Transforms |1⟩ into a superposition with opposite signs\n\n**H|0⟩ = (|0⟩ + |1⟩) / √2 = |+⟩**\n\n**H|1⟩ = (|0⟩ - |1⟩) / √2 = |-⟩**\n\nNotice that minus sign in the second equation — it's crucial for quantum interference!"
            }
        },

        # 4. Math: Hadamard Matrix
        {
            "type": "math",
            "content": {
                "title": "The Hadamard Matrix",
                "description": "Mathematically, the Hadamard gate is represented as a 2×2 matrix:",
                "equations": [
                    {
                        "label": "Hadamard Matrix",
                        "latex": "H = \\frac{1}{\\sqrt{2}} \\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}"
                    },
                    {
                        "label": "H applied to |0⟩",
                        "latex": "H|0\\rangle = \\frac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle)"
                    },
                    {
                        "label": "H applied to |1⟩",
                        "latex": "H|1\\rangle = \\frac{1}{\\sqrt{2}}(|0\\rangle - |1\\rangle)"
                    }
                ]
            }
        },

        # 5. Interactive Circuit: Basic Hadamard
        {
            "type": "circuit",
            "content": {
                "title": "Try It: Basic Superposition",
                "description": "This circuit applies an H gate to create superposition. Run it multiple times and watch the results!",
                "template": {
                    "numQubits": 1,
                    "gates": [
                        {"type": "H", "qubit": 0, "step": 0}
                    ]
                },
                "expectedOutput": "You should see approximately 50% |0⟩ and 50% |1⟩. Each run will vary due to quantum randomness!",
                "interactive": True,
                "showStatevector": True
            }
        },

        # 6. Callout: Quantum Randomness
        {
            "type": "callout",
            "content": {
                "variant": "info",
                "title": "True Randomness",
                "body": "Unlike pseudo-random numbers in classical computers, quantum randomness is **fundamentally unpredictable**. No hidden variables, no patterns — just genuine randomness from the laws of physics. This is why quantum random number generators are used for cryptography!"
            }
        },

        # 7. Probability Amplitudes
        {
            "type": "text",
            "content": {
                "title": "Understanding Probability Amplitudes",
                "body": "The numbers α and β in |ψ⟩ = α|0⟩ + β|1⟩ are called **probability amplitudes**. They're not the same as probabilities!\n\n**Key insight:** Amplitudes can be negative (or even complex). This is impossible for regular probabilities, but essential for quantum computing.\n\n**The relationship:**\n- Probability of |0⟩ = |α|² (amplitude squared)\n- Probability of |1⟩ = |β|² (amplitude squared)\n\nFor the |+⟩ state:\n- α = 1/√2, so P(0) = |1/√2|² = 1/2 = 50%\n- β = 1/√2, so P(1) = |1/√2|² = 1/2 = 50%"
            }
        },

        # 8. Comparison: |+⟩ vs |-⟩
        {
            "type": "comparison",
            "content": {
                "title": "|+⟩ vs |-⟩ States",
                "left": {
                    "title": "|+⟩ = (|0⟩ + |1⟩)/√2",
                    "items": [
                        "Created by H|0⟩",
                        "Amplitudes: +1/√2, +1/√2",
                        "50% chance of 0, 50% of 1",
                        "Points toward +X on Bloch sphere",
                        "Eigenstate of X gate with +1"
                    ]
                },
                "right": {
                    "title": "|-⟩ = (|0⟩ - |1⟩)/√2",
                    "items": [
                        "Created by H|1⟩",
                        "Amplitudes: +1/√2, -1/√2",
                        "50% chance of 0, 50% of 1",
                        "Points toward -X on Bloch sphere",
                        "Eigenstate of X gate with -1"
                    ]
                }
            }
        },

        # 9. Callout: Same probabilities, different states!
        {
            "type": "callout",
            "content": {
                "variant": "warning",
                "title": "Same Probabilities, Different States!",
                "body": "|+⟩ and |-⟩ both give 50/50 results when measured — but they're completely different quantum states! The difference (that minus sign) becomes visible through **interference**."
            }
        },

        # 10. Bloch Sphere: Visualizing superposition
        {
            "type": "bloch",
            "content": {
                "title": "Superposition on the Bloch Sphere",
                "description": "The equator of the Bloch sphere contains all equal superpositions. |+⟩ and |-⟩ are on opposite sides. Rotate the state to see different superpositions!",
                "initialState": {"theta": 1.5708, "phi": 0},
                "showControls": True,
                "annotations": [
                    {"position": "north", "label": "|0⟩"},
                    {"position": "south", "label": "|1⟩"},
                    {"position": "east", "label": "|+⟩"},
                    {"position": "west", "label": "|-⟩"}
                ]
            }
        },

        # 11. Quantum Interference
        {
            "type": "text",
            "content": {
                "title": "The Magic: Quantum Interference",
                "body": "Here's where quantum computing gets its power: **interference**.\n\nWhen you apply H twice to |0⟩, something remarkable happens:\n\n1. **H|0⟩ = |+⟩** (equal superposition)\n2. **H|+⟩ = |0⟩** (back to original!)\n\nWhy? Let's trace through:\n- H|+⟩ = H · (|0⟩ + |1⟩)/√2\n- = (H|0⟩ + H|1⟩)/√2\n- = (|+⟩ + |-⟩)/√2\n- = ((|0⟩+|1⟩) + (|0⟩-|1⟩))/2\n- = **|0⟩**\n\nThe |1⟩ components **cancelled out** due to opposite signs! This is interference."
            }
        },

        # 12. Circuit: H-H Interference
        {
            "type": "circuit",
            "content": {
                "title": "Interference in Action: H·H = I",
                "description": "Apply H twice and see the interference! The qubit returns to |0⟩ with 100% probability.",
                "template": {
                    "numQubits": 1,
                    "gates": [
                        {"type": "H", "qubit": 0, "step": 0},
                        {"type": "H", "qubit": 0, "step": 1}
                    ]
                },
                "expectedOutput": "100% |0⟩ — The H gates undo each other through interference!",
                "interactive": True,
                "showStatevector": True
            }
        },

        # 13. Callout: Interference is the key
        {
            "type": "callout",
            "content": {
                "variant": "tip",
                "title": "Interference = Quantum Algorithm Design",
                "body": "All quantum algorithms work by carefully arranging interference: amplitudes for wrong answers cancel out, while amplitudes for correct answers reinforce. This is the core technique behind Grover's search, Shor's factoring, and more!"
            }
        },

        # 14. Exercise: Create |-⟩
        {
            "type": "exercise",
            "content": {
                "title": "Exercise: Create the |-⟩ State",
                "description": "Create the |-⟩ state starting from |0⟩. Remember: |-⟩ = H|1⟩, so you'll need to flip first, then create superposition.",
                "difficulty": "easy",
                "objectives": [
                    "Start with |0⟩",
                    "Apply gates to create |-⟩",
                    "The state should have amplitudes +1/√2 and -1/√2"
                ],
                "template": {
                    "numQubits": 1,
                    "gates": []
                },
                "solution": {
                    "numQubits": 1,
                    "gates": [
                        {"type": "X", "qubit": 0, "step": 0},
                        {"type": "H", "qubit": 0, "step": 1}
                    ]
                },
                "hints": [
                    "|-⟩ = H|1⟩, but we start with |0⟩",
                    "First flip |0⟩ to |1⟩ using X gate",
                    "Then apply H to create |-⟩"
                ],
                "successMessage": "You created |-⟩! This state has the same measurement probabilities as |+⟩, but the negative amplitude will affect interference.",
                "failureMessage": "Remember: to get |-⟩, you need H|1⟩. So first flip to |1⟩, then apply H."
            }
        },

        # 15. Custom Superposition States
        {
            "type": "text",
            "content": {
                "title": "Beyond Equal Superposition",
                "body": "H creates 50/50 superposition, but what if you want different probabilities?\n\nThe **Ry (Y-rotation) gate** lets you create any superposition:\n\n**Ry(θ)|0⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩**\n\nExamples:\n- **Ry(π/2)** → 50/50 (same as H, up to phase)\n- **Ry(π/3)** → 75% |0⟩, 25% |1⟩\n- **Ry(2π/3)** → 25% |0⟩, 75% |1⟩\n\nThis gives you fine-grained control over your quantum states."
            }
        },

        # 16. Code Example
        {
            "type": "code",
            "content": {
                "title": "Custom Superposition in Qiskit",
                "description": "Create a state with 75% probability of |0⟩ and 25% probability of |1⟩:",
                "language": "python",
                "code": "from qiskit import QuantumCircuit, transpile\nfrom qiskit_aer import AerSimulator\nimport numpy as np\n\n# Create circuit\nqc = QuantumCircuit(1, 1)\n\n# Ry rotation for 75/25 split\n# cos²(θ/2) = 0.75 → θ/2 = arccos(√0.75) → θ ≈ π/3\ntheta = 2 * np.arccos(np.sqrt(0.75))\nqc.ry(theta, 0)\n\n# Measure\nqc.measure(0, 0)\n\n# Run\nsimulator = AerSimulator()\njob = simulator.run(transpile(qc, simulator), shots=1000)\ncounts = job.result().get_counts()\n\nprint(counts)\n# Expected: approximately {'0': 750, '1': 250}",
                "output": "{'0': 748, '1': 252}",
                "explanation": "The Ry gate rotates by θ around the Y-axis of the Bloch sphere. By choosing θ = 2·arccos(√0.75) ≈ π/3, we get the desired 75/25 probability split."
            }
        },

        # 17. Multiple Qubits
        {
            "type": "text",
            "content": {
                "title": "Superposition Scales Exponentially",
                "body": "Here's where quantum computing gets really exciting!\n\n**1 qubit in superposition:** 2 states simultaneously (|0⟩ and |1⟩)\n\n**2 qubits in superposition:** 4 states simultaneously (|00⟩, |01⟩, |10⟩, |11⟩)\n\n**3 qubits in superposition:** 8 states simultaneously\n\n**n qubits in superposition:** 2ⁿ states simultaneously!\n\nWith just 50 qubits, you can represent 2⁵⁰ ≈ 1 quadrillion states at once. That's more than all the grains of sand on Earth!"
            }
        },

        # 18. Circuit: 2-Qubit Superposition
        {
            "type": "circuit",
            "content": {
                "title": "2-Qubit Superposition",
                "description": "Apply H to both qubits to create a superposition of all 4 basis states with equal probability.",
                "template": {
                    "numQubits": 2,
                    "gates": [
                        {"type": "H", "qubit": 0, "step": 0},
                        {"type": "H", "qubit": 1, "step": 0}
                    ]
                },
                "expectedOutput": "25% each for |00⟩, |01⟩, |10⟩, |11⟩",
                "interactive": True,
                "showStatevector": True
            }
        },

        # 19. Exercise: 3-Qubit Uniform Superposition
        {
            "type": "exercise",
            "content": {
                "title": "Challenge: 3-Qubit Superposition",
                "description": "Create an equal superposition of all 8 basis states (|000⟩ through |111⟩).",
                "difficulty": "medium",
                "objectives": [
                    "Use 3 qubits",
                    "Each of the 8 states should have equal probability (12.5%)",
                    "Apply the appropriate gates"
                ],
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
                },
                "hints": [
                    "To put n qubits in superposition, what do you do to each qubit?",
                    "Apply H to all three qubits",
                    "They can all be applied at the same step (in parallel)"
                ],
                "successMessage": "Excellent! You've created a superposition of 8 states with just 3 gates. Imagine doing this with 50 qubits — you'd represent 2^50 states!",
                "failureMessage": "Apply H to each of the three qubits to put them all in superposition."
            }
        },

        # 20. Quiz
        {
            "type": "quiz",
            "content": {
                "title": "Test Your Understanding",
                "questions": [
                    {
                        "question": "What is H·H (applying Hadamard twice)?",
                        "options": ["H (single Hadamard)", "X (NOT gate)", "I (Identity)", "Z (Phase flip)"],
                        "correctIndex": 2,
                        "explanation": "H·H = I (identity). The first H creates superposition, and the second H causes the states to interfere and return to the original state."
                    },
                    {
                        "question": "The states |+⟩ and |-⟩ have the same measurement probabilities. What makes them different?",
                        "options": ["Nothing, they're the same state", "The sign of one amplitude", "The number of qubits", "The measurement basis"],
                        "correctIndex": 1,
                        "explanation": "|+⟩ = (|0⟩+|1⟩)/√2 and |-⟩ = (|0⟩-|1⟩)/√2. The minus sign doesn't affect probabilities directly, but it changes how the states interfere."
                    },
                    {
                        "question": "How many states can 10 qubits represent in superposition?",
                        "options": ["10", "20", "100", "1024"],
                        "correctIndex": 3,
                        "explanation": "n qubits can represent 2^n states. 2^10 = 1024 states."
                    },
                    {
                        "question": "To create the state (|0⟩ - |1⟩)/√2, starting from |0⟩, what gates do you apply?",
                        "options": ["H only", "X only", "X then H", "H then X"],
                        "correctIndex": 2,
                        "explanation": "(|0⟩-|1⟩)/√2 = |-⟩ = H|1⟩. So first flip |0⟩ to |1⟩ with X, then apply H."
                    }
                ]
            }
        },

        # 21. Summary
        {
            "type": "summary",
            "content": {
                "title": "Key Takeaways",
                "points": [
                    {
                        "title": "Hadamard Creates Superposition",
                        "description": "H|0⟩ = |+⟩ and H|1⟩ = |-⟩. It's your main tool for creating quantum parallelism."
                    },
                    {
                        "title": "Amplitudes vs Probabilities",
                        "description": "Amplitudes can be negative; probabilities come from squaring amplitudes. Negative amplitudes enable interference."
                    },
                    {
                        "title": "Quantum Interference",
                        "description": "Amplitudes can add (constructive) or cancel (destructive). This is how quantum algorithms find correct answers."
                    },
                    {
                        "title": "Exponential Scaling",
                        "description": "n qubits in superposition represent 2^n states — exponential power from linear resources."
                    }
                ],
                "nextLesson": {
                    "id": "measurement",
                    "title": "Measurement",
                    "description": "Learn how measurement collapses superposition and extracts classical information from quantum states."
                }
            }
        },

        # 22. Sandbox
        {
            "type": "sandbox",
            "content": {
                "title": "Experiment with Superposition",
                "description": "Create your own superposition experiments! Try combining H with other gates.",
                "suggestedExperiments": [
                    "Apply H to multiple qubits and observe the exponential growth",
                    "Try H-X-H and H-Z-H — how do they differ?",
                    "Create a superposition and then try to 'undo' it with interference",
                    "Experiment with Ry rotations for unequal superpositions"
                ],
                "preloadCircuit": {
                    "numQubits": 2,
                    "gates": [
                        {"type": "H", "qubit": 0, "step": 0},
                        {"type": "H", "qubit": 1, "step": 0}
                    ]
                }
            }
        }
    ]
}
