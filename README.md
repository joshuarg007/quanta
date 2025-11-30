# ◈ QUANTA

**Quantum Unified Abstraction for Next-gen Algorithmics**

A visual quantum computing learning platform that makes quantum mechanics accessible through interactive simulation and structured curriculum.

---

## Vision

QUANTA solves the largest barrier in quantum education: **quantum computing is hard to learn because it is invisible.**

Turn abstract quantum mechanics into concrete, visual, and explorable concepts. Learn quantum computing like learning to code — experiment, observe, adjust, understand.

---

## Features

- **Visual Circuit Builder** — Drag-and-drop quantum gates with bidirectional code sync
- **State Visualization** — Watch quantum states evolve on Bloch spheres and probability distributions
- **Guided Curriculum** — Structured lessons from qubits to Grover's algorithm
- **Powerful Simulation** — Up to 16 qubits powered by Qiskit
- **Sandbox Mode** — Free experimentation without constraints

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Zustand |
| Backend | Python, FastAPI, Qiskit, Qiskit Aer |
| Database | PostgreSQL |
| Infrastructure | Docker, (AWS later) |

---

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose (optional)

### Local Development

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000
```

### Docker (Full Stack)

```bash
docker-compose up --build
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000
# Postgres: localhost:5432
```

---

## Project Structure

```
quanta/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── circuit/      # Circuit builder UI
│   │   │   ├── visualizer/   # State visualization
│   │   │   ├── lessons/      # Curriculum UI
│   │   │   └── sandbox/      # Free experimentation
│   │   ├── stores/           # Zustand state
│   │   ├── api/              # Backend client
│   │   └── types/            # TypeScript types
│   └── package.json
│
├── backend/                  # Python + FastAPI
│   ├── app/
│   │   ├── api/              # REST endpoints
│   │   ├── simulation/       # Qiskit engine
│   │   ├── curriculum/       # Lesson content
│   │   └── models/           # Database models
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/simulate` | POST | Run circuit simulation |
| `/api/simulate/statevector` | POST | Get state vector |
| `/api/simulate/steps` | POST | Step-by-step simulation |
| `/api/circuits` | GET/POST | List/save circuits |
| `/api/curriculum/lessons` | GET | List lessons |

---

## Supported Quantum Gates

| Gate | Type | Description |
|------|------|-------------|
| H | Single | Hadamard — creates superposition |
| X, Y, Z | Single | Pauli gates |
| S, T | Single | Phase gates |
| RX, RY, RZ | Single | Rotation gates |
| CNOT | Two | Controlled-NOT |
| CZ | Two | Controlled-Z |
| SWAP | Two | Swap qubits |
| TOFFOLI | Three | CCX gate |

---

## Roadmap

- [x] Core simulation engine (Qiskit)
- [x] Circuit builder UI
- [x] State visualization
- [ ] Full curriculum content
- [ ] User authentication
- [ ] Circuit sharing
- [ ] Classroom mode
- [ ] AWS Braket integration
- [ ] Noise models

---

## Contributing

QUANTA is developed by [Axion Deep Labs](https://axiondeep.com) and gifted pro bono to university students worldwide.

---

## License

MIT License — See [LICENSE](LICENSE) for details.
