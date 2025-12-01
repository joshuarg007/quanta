"""AI Quantum Tutor API - Claude-powered learning assistant."""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import json

router = APIRouter()

# Anthropic client (will be imported if available)
try:
    import anthropic
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
    ANTHROPIC_AVAILABLE = bool(os.getenv("ANTHROPIC_API_KEY"))
except ImportError:
    client = None
    ANTHROPIC_AVAILABLE = False


class Gate(BaseModel):
    id: str
    type: str
    qubit: int
    controlQubit: Optional[int] = None
    step: int
    parameter: Optional[float] = None


class CircuitContext(BaseModel):
    numQubits: int
    gates: List[Gate]
    circuitName: str = "Untitled"


class TutorMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class TutorRequest(BaseModel):
    message: str
    circuit: Optional[CircuitContext] = None
    history: List[TutorMessage] = []
    mode: str = "chat"  # "chat", "explain", "debug", "suggest"


SYSTEM_PROMPT = """You are QUANTA's AI Quantum Tutor - a friendly, knowledgeable assistant who helps users learn quantum computing. You have a deep understanding of quantum mechanics, quantum gates, and quantum algorithms.

Your personality:
- Enthusiastic about quantum computing but not condescending
- You explain complex concepts using intuitive analogies
- You celebrate when users understand something new
- You're patient with beginners but can go deep with advanced users

Your capabilities:
- Explain quantum concepts (superposition, entanglement, interference)
- Analyze quantum circuits and explain what they do
- Debug circuits that aren't producing expected results
- Suggest improvements or alternative approaches
- Guide users through building specific algorithms (Bell states, Grover's, etc.)

When a circuit is provided, analyze it and refer to specific gates and qubits. Use |ket⟩ notation for quantum states.

Keep responses concise but informative. Use markdown formatting for clarity. Include relevant equations when helpful, using Unicode symbols like:
- |0⟩, |1⟩, |+⟩, |−⟩ for states
- ⊗ for tensor product
- √ for square root
- π for pi

If the user seems stuck, offer a hint rather than the full solution."""


def format_circuit_context(circuit: CircuitContext) -> str:
    """Format circuit context for the AI."""
    if not circuit or not circuit.gates:
        return "No circuit provided - the user is asking a general question."

    gates_by_step = {}
    for gate in circuit.gates:
        step = gate.step
        if step not in gates_by_step:
            gates_by_step[step] = []

        gate_str = f"{gate.type} on q{gate.qubit}"
        if gate.controlQubit is not None:
            gate_str = f"{gate.type} (control: q{gate.controlQubit}, target: q{gate.qubit})"
        if gate.parameter is not None:
            gate_str += f" (θ={gate.parameter:.3f})"
        gates_by_step[step].append(gate_str)

    circuit_desc = f"Circuit: '{circuit.circuitName}' with {circuit.numQubits} qubit(s)\n"
    for step in sorted(gates_by_step.keys()):
        circuit_desc += f"  Step {step}: {', '.join(gates_by_step[step])}\n"

    return circuit_desc


@router.post("/tutor/chat")
async def chat_with_tutor(request: TutorRequest):
    """Chat with the AI quantum tutor."""
    if not ANTHROPIC_AVAILABLE:
        # Return a helpful mock response when API key not configured
        return {
            "response": "🔧 **AI Tutor Setup Required**\n\nTo enable the AI Quantum Tutor, add your Anthropic API key:\n\n```bash\nexport ANTHROPIC_API_KEY=your-key-here\n```\n\nOnce configured, I'll be your personal quantum computing guide!",
            "mode": request.mode,
        }

    # Build context-aware prompt
    circuit_context = format_circuit_context(request.circuit) if request.circuit else ""

    messages = []

    # Add conversation history
    for msg in request.history[-10:]:  # Keep last 10 messages for context
        messages.append({
            "role": msg.role,
            "content": msg.content
        })

    # Add current message with circuit context
    user_content = request.message
    if circuit_context:
        user_content = f"[Current Circuit]\n{circuit_context}\n\n[User Question]\n{request.message}"

    messages.append({
        "role": "user",
        "content": user_content
    })

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=messages
        )

        return {
            "response": response.content[0].text,
            "mode": request.mode,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tutor/stream")
async def stream_tutor_response(request: TutorRequest):
    """Stream the AI tutor response for better UX."""
    if not ANTHROPIC_AVAILABLE:
        async def mock_stream():
            yield "data: " + json.dumps({"text": "🔧 AI Tutor requires ANTHROPIC_API_KEY to be set."}) + "\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(mock_stream(), media_type="text/event-stream")

    circuit_context = format_circuit_context(request.circuit) if request.circuit else ""

    messages = []
    for msg in request.history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})

    user_content = request.message
    if circuit_context:
        user_content = f"[Current Circuit]\n{circuit_context}\n\n[User Question]\n{request.message}"

    messages.append({"role": "user", "content": user_content})

    async def generate():
        try:
            with client.messages.stream(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=SYSTEM_PROMPT,
                messages=messages
            ) as stream:
                for text in stream.text_stream:
                    yield f"data: {json.dumps({'text': text})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/tutor/status")
async def tutor_status():
    """Check if the AI tutor is available."""
    return {
        "available": ANTHROPIC_AVAILABLE,
        "message": "AI Tutor ready!" if ANTHROPIC_AVAILABLE else "Set ANTHROPIC_API_KEY to enable"
    }
