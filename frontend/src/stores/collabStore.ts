// Collaboration Store - Real-time multiplayer state management
import { create } from 'zustand';
import { useCircuitStore } from './circuitStore';

export interface Cursor {
  x: number;
  y: number;
  qubit?: number;
  step?: number;
}

export interface Participant {
  user_id: string;
  username: string;
  color: string;
  cursor?: Cursor;
  joined_at: string;
}

export interface ChatMessage {
  user_id: string;
  message: string;
  timestamp: string;
}

interface CollabState {
  // Connection state
  isConnected: boolean;
  roomId: string | null;
  userId: string | null;
  username: string;

  // Room state
  participants: Participant[];
  chatMessages: ChatMessage[];

  // WebSocket
  socket: WebSocket | null;

  // Actions
  setUsername: (username: string) => void;
  createRoom: () => Promise<string>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => void;
  sendCursorMove: (cursor: Cursor) => void;
  sendGateAdd: (gate: { type: string; qubit: number; step: number; id?: string }) => void;
  sendGateRemove: (gateId: string) => void;
  sendGateMove: (gateId: string, qubit: number, step: number) => void;
  sendCircuitUpdate: (circuit: { numQubits: number; gates: unknown[]; name?: string }) => void;
  sendQubitCountChange: (numQubits: number) => void;
  sendChatMessage: (message: string) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE = API_BASE.replace('http', 'ws');

export const useCollabStore = create<CollabState>((set, get) => {
  // Internal helper functions
  const connectWebSocket = (roomId: string, usrId: string) => {
    const socket = new WebSocket(`${WS_BASE}/api/collab/ws/${roomId}/${usrId}`);

    socket.onopen = () => {
      console.log('Connected to collaboration room');
      set({ isConnected: true, socket });
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleMessage(data);
    };

    socket.onclose = () => {
      console.log('Disconnected from collaboration room');
      set({ isConnected: false, socket: null });
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const handleMessage = (data: { type: string; [key: string]: unknown }) => {
    const circuitStore = useCircuitStore.getState();

    switch (data.type) {
      case 'room_state':
        set({ participants: data.participants as Participant[] });
        break;

      case 'participant_joined':
        set(state => ({
          participants: [...state.participants, data.participant as Participant],
        }));
        break;

      case 'participant_left':
        set(state => ({
          participants: state.participants.filter(p => p.user_id !== data.user_id),
        }));
        break;

      case 'cursor_update':
        set(state => ({
          participants: state.participants.map(p =>
            p.user_id === data.user_id ? { ...p, cursor: data.cursor as Cursor } : p
          ),
        }));
        break;

      case 'gate_added': {
        const gate = data.gate as { type: string; qubit: number; step: number };
        circuitStore.addGate({ type: gate.type as 'H' | 'X' | 'Y' | 'Z' | 'CNOT' | 'CZ' | 'SWAP' | 'RX' | 'RY' | 'RZ' | 'T' | 'S' | 'MEASURE' | 'TOFFOLI', qubit: gate.qubit, step: gate.step });
        break;
      }

      case 'gate_removed':
        circuitStore.removeGate(data.gate_id as string);
        break;

      case 'gate_moved': {
        circuitStore.updateGate(data.gate_id as string, {
          qubit: data.qubit as number,
          step: data.step as number,
        });
        break;
      }

      case 'circuit_updated': {
        const circuit = data.circuit as { numQubits: number; gates: unknown[]; name?: string };
        const currentCircuit = circuitStore.circuit;
        circuitStore.loadCircuit({
          ...currentCircuit,
          id: get().roomId || 'shared',
          name: circuit.name || 'Shared Circuit',
          numQubits: circuit.numQubits,
          gates: circuit.gates as typeof currentCircuit.gates,
          updatedAt: new Date().toISOString(),
        });
        break;
      }

      case 'qubit_count_changed':
        circuitStore.setNumQubits(data.num_qubits as number);
        break;

      case 'chat_message':
        set(state => ({
          chatMessages: [...state.chatMessages, {
            user_id: data.user_id as string,
            message: data.message as string,
            timestamp: data.timestamp as string,
          }],
        }));
        break;
    }
  };

  return {
    isConnected: false,
    roomId: null,
    userId: null,
    username: 'Anonymous',
    participants: [],
    chatMessages: [],
    socket: null,

    setUsername: (username: string) => {
      set({ username });
    },

    createRoom: async () => {
      const { username } = get();
      const circuitStore = useCircuitStore.getState();

      const response = await fetch(`${API_BASE}/api/collab/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circuit: {
            numQubits: circuitStore.circuit.numQubits,
            gates: circuitStore.circuit.gates,
            name: circuitStore.circuit.name,
          },
          username,
        }),
      });

      const data = await response.json();
      const { room_id, user_id } = data;

      set({ roomId: room_id, userId: user_id });

      // Connect to WebSocket
      connectWebSocket(room_id, user_id);

      return room_id;
    },

    joinRoom: async (roomId: string) => {
      const { username } = get();

      const response = await fetch(`${API_BASE}/api/collab/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Room not found');
      }

      const data = await response.json();
      const { user_id, circuit, participants } = data;

      // Update local circuit with room's circuit
      const circuitStore = useCircuitStore.getState();
      const currentCircuit = circuitStore.circuit;
      circuitStore.loadCircuit({
        ...currentCircuit,
        id: roomId,
        name: circuit.name || 'Shared Circuit',
        numQubits: circuit.numQubits,
        gates: circuit.gates,
        updatedAt: new Date().toISOString(),
      });

      set({
        roomId,
        userId: user_id,
        participants,
      });

      // Connect to WebSocket
      connectWebSocket(roomId, user_id);
    },

    leaveRoom: () => {
      const { socket } = get();
      if (socket) {
        socket.close();
      }
      set({
        isConnected: false,
        roomId: null,
        userId: null,
        participants: [],
        chatMessages: [],
        socket: null,
      });
    },

    sendCursorMove: (cursor: Cursor) => {
      const { socket, isConnected } = get();
      if (socket && isConnected) {
        socket.send(JSON.stringify({ type: 'cursor_move', cursor }));
      }
    },

    sendGateAdd: (gate) => {
      const { socket, isConnected } = get();
      if (socket && isConnected) {
        socket.send(JSON.stringify({ type: 'gate_add', gate }));
      }
    },

    sendGateRemove: (gateId: string) => {
      const { socket, isConnected } = get();
      if (socket && isConnected) {
        socket.send(JSON.stringify({ type: 'gate_remove', gate_id: gateId }));
      }
    },

    sendGateMove: (gateId: string, qubit: number, step: number) => {
      const { socket, isConnected } = get();
      if (socket && isConnected) {
        socket.send(JSON.stringify({ type: 'gate_move', gate_id: gateId, qubit, step }));
      }
    },

    sendCircuitUpdate: (circuit) => {
      const { socket, isConnected } = get();
      if (socket && isConnected) {
        socket.send(JSON.stringify({ type: 'circuit_update', circuit }));
      }
    },

    sendQubitCountChange: (numQubits: number) => {
      const { socket, isConnected } = get();
      if (socket && isConnected) {
        socket.send(JSON.stringify({ type: 'qubit_count_change', num_qubits: numQubits }));
      }
    },

    sendChatMessage: (message: string) => {
      const { socket, isConnected } = get();
      if (socket && isConnected) {
        socket.send(JSON.stringify({ type: 'chat_message', message }));
      }
    },
  };
});
