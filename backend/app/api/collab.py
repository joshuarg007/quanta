"""Live Collaboration API - Real-time multiplayer circuit editing."""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Set
import json
import asyncio
from datetime import datetime
import uuid

router = APIRouter()


class Cursor(BaseModel):
    x: float
    y: float
    qubit: Optional[int] = None
    step: Optional[int] = None


class Participant(BaseModel):
    user_id: str
    username: str
    color: str
    cursor: Optional[Cursor] = None
    joined_at: str


class RoomState(BaseModel):
    room_id: str
    circuit: dict
    participants: List[Participant]
    created_at: str
    owner_id: str


# In-memory room storage (use Redis in production)
rooms: Dict[str, dict] = {}
connections: Dict[str, Dict[str, WebSocket]] = {}  # room_id -> {user_id: websocket}

# Vibrant colors for participants
PARTICIPANT_COLORS = [
    "#FF6B6B",  # Coral Red
    "#4ECDC4",  # Teal
    "#FFE66D",  # Yellow
    "#95E1D3",  # Mint
    "#F38181",  # Salmon
    "#AA96DA",  # Lavender
    "#FCBAD3",  # Pink
    "#A8D8EA",  # Sky Blue
]


def get_participant_color(index: int) -> str:
    """Get a color for a participant based on their join order."""
    return PARTICIPANT_COLORS[index % len(PARTICIPANT_COLORS)]


class RoomCreateRequest(BaseModel):
    circuit: dict
    username: str


class RoomJoinRequest(BaseModel):
    username: str


@router.post("/collab/rooms")
async def create_room(request: RoomCreateRequest):
    """Create a new collaboration room."""
    room_id = str(uuid.uuid4())[:8]  # Short room code
    user_id = str(uuid.uuid4())

    rooms[room_id] = {
        "room_id": room_id,
        "circuit": request.circuit,
        "participants": [{
            "user_id": user_id,
            "username": request.username,
            "color": get_participant_color(0),
            "cursor": None,
            "joined_at": datetime.utcnow().isoformat(),
        }],
        "created_at": datetime.utcnow().isoformat(),
        "owner_id": user_id,
        "circuit_history": [],
    }
    connections[room_id] = {}

    return {
        "room_id": room_id,
        "user_id": user_id,
        "room_url": f"/sandbox?room={room_id}",
    }


@router.post("/collab/rooms/{room_id}/join")
async def join_room(room_id: str, request: RoomJoinRequest):
    """Join an existing collaboration room."""
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room = rooms[room_id]
    user_id = str(uuid.uuid4())
    color = get_participant_color(len(room["participants"]))

    participant = {
        "user_id": user_id,
        "username": request.username,
        "color": color,
        "cursor": None,
        "joined_at": datetime.utcnow().isoformat(),
    }
    room["participants"].append(participant)

    # Broadcast join to all connected users
    await broadcast_to_room(room_id, {
        "type": "participant_joined",
        "participant": participant,
    }, exclude_user=None)

    return {
        "room_id": room_id,
        "user_id": user_id,
        "circuit": room["circuit"],
        "participants": room["participants"],
    }


@router.get("/collab/rooms/{room_id}")
async def get_room(room_id: str):
    """Get room state."""
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room = rooms[room_id]
    return {
        "room_id": room_id,
        "circuit": room["circuit"],
        "participants": room["participants"],
        "owner_id": room["owner_id"],
    }


async def broadcast_to_room(room_id: str, message: dict, exclude_user: Optional[str] = None):
    """Broadcast a message to all connected users in a room."""
    if room_id not in connections:
        return

    disconnected = []
    for user_id, websocket in connections[room_id].items():
        if user_id != exclude_user:
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(user_id)

    # Clean up disconnected users
    for user_id in disconnected:
        del connections[room_id][user_id]


@router.websocket("/collab/ws/{room_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    """WebSocket endpoint for real-time collaboration."""
    await websocket.accept()

    if room_id not in rooms:
        await websocket.close(code=4004, reason="Room not found")
        return

    room = rooms[room_id]
    participant = next((p for p in room["participants"] if p["user_id"] == user_id), None)

    if not participant:
        await websocket.close(code=4003, reason="Not a participant")
        return

    # Register connection
    if room_id not in connections:
        connections[room_id] = {}
    connections[room_id][user_id] = websocket

    # Send current room state
    await websocket.send_json({
        "type": "room_state",
        "circuit": room["circuit"],
        "participants": room["participants"],
    })

    try:
        while True:
            data = await websocket.receive_json()
            await handle_message(room_id, user_id, data)
    except WebSocketDisconnect:
        await handle_disconnect(room_id, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await handle_disconnect(room_id, user_id)


async def handle_message(room_id: str, user_id: str, data: dict):
    """Handle incoming WebSocket messages."""
    message_type = data.get("type")
    room = rooms.get(room_id)

    if not room:
        return

    if message_type == "cursor_move":
        # Update cursor position
        for p in room["participants"]:
            if p["user_id"] == user_id:
                p["cursor"] = data.get("cursor")
                break

        await broadcast_to_room(room_id, {
            "type": "cursor_update",
            "user_id": user_id,
            "cursor": data.get("cursor"),
        }, exclude_user=user_id)

    elif message_type == "gate_add":
        # Add a gate to the circuit
        gate = data.get("gate")
        if gate:
            room["circuit"]["gates"].append(gate)
            await broadcast_to_room(room_id, {
                "type": "gate_added",
                "gate": gate,
                "user_id": user_id,
            }, exclude_user=user_id)

    elif message_type == "gate_remove":
        # Remove a gate from the circuit
        gate_id = data.get("gate_id")
        if gate_id:
            room["circuit"]["gates"] = [
                g for g in room["circuit"]["gates"] if g.get("id") != gate_id
            ]
            await broadcast_to_room(room_id, {
                "type": "gate_removed",
                "gate_id": gate_id,
                "user_id": user_id,
            }, exclude_user=user_id)

    elif message_type == "gate_move":
        # Move a gate
        gate_id = data.get("gate_id")
        new_qubit = data.get("qubit")
        new_step = data.get("step")

        for gate in room["circuit"]["gates"]:
            if gate.get("id") == gate_id:
                gate["qubit"] = new_qubit
                gate["step"] = new_step
                break

        await broadcast_to_room(room_id, {
            "type": "gate_moved",
            "gate_id": gate_id,
            "qubit": new_qubit,
            "step": new_step,
            "user_id": user_id,
        }, exclude_user=user_id)

    elif message_type == "circuit_update":
        # Full circuit update (for complex changes)
        room["circuit"] = data.get("circuit", room["circuit"])
        await broadcast_to_room(room_id, {
            "type": "circuit_updated",
            "circuit": room["circuit"],
            "user_id": user_id,
        }, exclude_user=user_id)

    elif message_type == "qubit_count_change":
        # Change number of qubits
        num_qubits = data.get("num_qubits")
        if num_qubits:
            room["circuit"]["numQubits"] = num_qubits
            await broadcast_to_room(room_id, {
                "type": "qubit_count_changed",
                "num_qubits": num_qubits,
                "user_id": user_id,
            }, exclude_user=user_id)

    elif message_type == "chat_message":
        # Chat in the collaboration room
        await broadcast_to_room(room_id, {
            "type": "chat_message",
            "user_id": user_id,
            "message": data.get("message"),
            "timestamp": datetime.utcnow().isoformat(),
        })


async def handle_disconnect(room_id: str, user_id: str):
    """Handle user disconnect."""
    if room_id in connections and user_id in connections[room_id]:
        del connections[room_id][user_id]

    if room_id in rooms:
        room = rooms[room_id]
        room["participants"] = [
            p for p in room["participants"] if p["user_id"] != user_id
        ]

        # Broadcast leave
        await broadcast_to_room(room_id, {
            "type": "participant_left",
            "user_id": user_id,
        })

        # Clean up empty rooms after a delay
        if not room["participants"]:
            await asyncio.sleep(60)  # Keep room for 1 minute after last person leaves
            if room_id in rooms and not rooms[room_id]["participants"]:
                del rooms[room_id]
                if room_id in connections:
                    del connections[room_id]
