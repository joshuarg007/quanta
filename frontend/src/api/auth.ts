// Auth API for QUANTA
import { apiClient } from './client';

export interface User {
  id: number;
  email: string;
  name: string | null;
  account_type: 'free' | 'pro' | 'student' | 'org_member';
  is_student: boolean;
  circuits_limit: number;
  organization_id: number | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

// Token storage
let ACCESS_TOKEN: string | null = null;
let REFRESH_TOKEN: string | null = null;

try {
  ACCESS_TOKEN = localStorage.getItem('access_token');
  REFRESH_TOKEN = localStorage.getItem('refresh_token');
} catch {
  // SSR or localStorage unavailable
}

export function setTokens(access: string | null, refresh: string | null) {
  ACCESS_TOKEN = access;
  REFRESH_TOKEN = refresh;
  try {
    if (access) {
      localStorage.setItem('access_token', access);
    } else {
      localStorage.removeItem('access_token');
    }
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    } else {
      localStorage.removeItem('refresh_token');
    }
  } catch {
    // ignore
  }
}

export function clearTokens() {
  setTokens(null, null);
}

export function getAccessToken() {
  return ACCESS_TOKEN;
}

// Add auth header to requests
apiClient.interceptors.request.use((config) => {
  if (ACCESS_TOKEN) {
    config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }
  return config;
});

// Handle 401 errors and try to refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && REFRESH_TOKEN) {
      originalRequest._retry = true;

      try {
        const response = await apiClient.post<TokenResponse>('/api/auth/refresh', {
          refresh_token: REFRESH_TOKEN,
        });

        setTokens(response.data.access_token, response.data.refresh_token);
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;

        return apiClient(originalRequest);
      } catch {
        clearTokens();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (data: RegisterData): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/api/auth/register', data);
    setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  },

  login: async (email: string, password: string): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await apiClient.post<TokenResponse>('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      clearTokens();
    }
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  },

  refresh: async (): Promise<TokenResponse | null> => {
    if (!REFRESH_TOKEN) return null;

    try {
      const response = await apiClient.post<TokenResponse>('/api/auth/refresh', {
        refresh_token: REFRESH_TOKEN,
      });
      setTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch {
      clearTokens();
      return null;
    }
  },
};
