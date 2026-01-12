// API client for QUANTA backend
import axios from 'axios';
import type { QuantumCircuit, SimulationResult } from '../types/quantum';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for HTTP-only cookies
});

// Simulation API
export const simulationApi = {
  // Run a circuit simulation
  simulate: async (circuit: QuantumCircuit, shots?: number): Promise<SimulationResult> => {
    const response = await apiClient.post('/api/simulate', {
      circuit,
      shots: shots || 1024,
    });
    return response.data;
  },

  // Get state vector without measurement
  getStateVector: async (circuit: QuantumCircuit): Promise<SimulationResult> => {
    const response = await apiClient.post('/api/simulate/statevector', {
      circuit,
    });
    return response.data;
  },

  // Step-by-step simulation for visualization
  simulateSteps: async (circuit: QuantumCircuit): Promise<SimulationResult> => {
    const response = await apiClient.post('/api/simulate/steps', {
      circuit,
    });
    return response.data;
  },
};

// Circuit storage API
export const circuitApi = {
  // Save a circuit
  save: async (circuit: QuantumCircuit): Promise<QuantumCircuit> => {
    const response = await apiClient.post('/api/circuits', circuit);
    return response.data;
  },

  // Get all user circuits
  list: async (): Promise<QuantumCircuit[]> => {
    const response = await apiClient.get('/api/circuits');
    return response.data;
  },

  // Get a specific circuit
  get: async (id: string): Promise<QuantumCircuit> => {
    const response = await apiClient.get(`/api/circuits/${id}`);
    return response.data;
  },

  // Delete a circuit
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/circuits/${id}`);
  },

  // Share a circuit (get public link)
  share: async (id: string): Promise<{ shareUrl: string }> => {
    const response = await apiClient.post(`/api/circuits/${id}/share`);
    return response.data;
  },
};

// Curriculum API
export interface LessonMeta {
  id: string;
  title: string;
  track: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  prerequisites: string[];
}

export interface TextContent {
  title: string;
  body: string;
}

export interface CircuitContent {
  title?: string;
  description: string;
  template: {
    numQubits: number;
    gates: Array<{
      type: string;
      qubit: number;
      controlQubit?: number;
      step: number;
      parameter?: number;
    }>;
  };
  expectedOutput?: string;
}

export interface ExerciseContent {
  title: string;
  description: string;
  hint?: string;
  template: {
    numQubits: number;
    gates: Array<{
      type: string;
      qubit: number;
      controlQubit?: number;
      step: number;
      parameter?: number;
    }>;
  };
  solution?: {
    numQubits: number;
    gates: Array<{
      type: string;
      qubit: number;
      controlQubit?: number;
      step: number;
      parameter?: number;
    }>;
  };
}

export interface QuizContent {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonSection {
  type: 'hero' | 'text' | 'callout' | 'comparison' | 'math' | 'circuit' | 'exercise' | 'code' | 'bloch' | 'quiz' | 'summary' | 'sandbox';
  content: Record<string, unknown>;
}

export interface LessonFull {
  id: string;
  title: string;
  track: string;
  sections: LessonSection[];
}

export interface Track {
  id: string;
  title: string;
  description: string;
  lessons: LessonMeta[];
}

export const curriculumApi = {
  // Get all lessons
  listLessons: async (): Promise<LessonMeta[]> => {
    const response = await apiClient.get('/api/curriculum/lessons');
    return response.data;
  },

  // Get tracks with lessons
  getTracks: async (): Promise<Track[]> => {
    const response = await apiClient.get('/api/curriculum/tracks');
    return response.data;
  },

  // Get lesson content
  getLesson: async (id: string): Promise<LessonFull> => {
    const response = await apiClient.get(`/api/curriculum/lessons/${id}`);
    return response.data;
  },

  // Track progress
  markComplete: async (lessonId: string): Promise<void> => {
    await apiClient.post(`/api/curriculum/progress/${lessonId}/complete`);
  },

  // Get user progress
  getProgress: async (): Promise<Record<string, { completed: boolean }>> => {
    const response = await apiClient.get('/api/curriculum/progress');
    return response.data;
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string; version: string }> => {
  const response = await apiClient.get('/health');
  return response.data;
};
