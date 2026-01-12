// Auth API for QUANTA
// Uses HTTP-only cookies for secure token storage
import { apiClient } from './client';

// =============================================================================
// TYPES
// =============================================================================

export interface Organization {
  id: number;
  name: string | null;
  plan: 'free' | 'education' | 'research';
  is_axion: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: 'OWNER' | 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'RESEARCHER';
  is_approved: boolean;
  email_verified: boolean;
  organization: Organization;
}

export interface UsageStats {
  simulation_runs: {
    current: number;
    limit: number | 'unlimited';
    percent: number;
    remaining: number | 'unlimited';
  };
  circuits: {
    current: number;
    limit: number | 'unlimited';
    percent: number;
    remaining: number | 'unlimited';
  };
  storage_bytes: {
    current: number;
    limit: number | 'unlimited';
    percent: number;
    remaining: number | 'unlimited';
  };
  experiments: {
    current: number;
    limit: number | 'unlimited';
    percent: number;
    remaining: number | 'unlimited';
  };
  experiment_runs: {
    current: number;
    limit: number | 'unlimited';
    percent: number;
    remaining: number | 'unlimited';
  };
  plan: string;
  resets_at: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SignupResponse {
  message: string;
  email: string;
  organization_id: number;
  is_first_user: boolean;
  requires_approval: boolean;
}

export interface MeResponse {
  user: User;
  usage: UsageStats;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

// =============================================================================
// AUTH API
// =============================================================================

export const authApi = {
  /**
   * Register a new user.
   * Creates org if needed, sets auth cookies.
   */
  register: async (data: RegisterData): Promise<SignupResponse> => {
    const response = await apiClient.post<SignupResponse>('/api/orgs/signup', data);
    return response.data;
  },

  /**
   * Login with email and password.
   * Sets HTTP-only auth cookies.
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await apiClient.post<LoginResponse>('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Logout - clears auth cookies.
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  /**
   * Get current user info and usage stats.
   * Uses cookies for authentication.
   */
  me: async (): Promise<MeResponse> => {
    const response = await apiClient.get<MeResponse>('/api/auth/me');
    return response.data;
  },

  /**
   * Refresh tokens using refresh cookie.
   */
  refresh: async (): Promise<LoginResponse | null> => {
    try {
      const response = await apiClient.post<LoginResponse>('/api/auth/refresh');
      return response.data;
    } catch {
      return null;
    }
  },
};

// =============================================================================
// ORGANIZATION API
// =============================================================================

export interface OrgUsageResponse {
  organization: {
    id: number;
    name: string | null;
    domain: string;
    plan: string;
    subscription_status: string;
    trial_ends_at: string | null;
    is_axion: boolean;
    created_at: string;
  };
  usage: UsageStats;
}

export const orgApi = {
  /**
   * Get current organization and usage.
   */
  getCurrent: async (): Promise<OrgUsageResponse> => {
    const response = await apiClient.get<OrgUsageResponse>('/api/orgs/current');
    return response.data;
  },

  /**
   * List users in current organization.
   */
  listUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/api/orgs/users');
    return response.data;
  },

  /**
   * Approve a user (OWNER/ADMIN only).
   */
  approveUser: async (userId: number): Promise<void> => {
    await apiClient.post(`/api/orgs/users/${userId}/approve`);
  },

  /**
   * Update user role (OWNER only).
   */
  updateUserRole: async (userId: number, role: string): Promise<void> => {
    await apiClient.put(`/api/orgs/users/${userId}/role`, { role });
  },
};
