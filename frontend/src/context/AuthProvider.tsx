// AuthProvider context for QUANTA
// Manages authentication state with HTTP-only cookie support
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth';
import type { User, UsageStats, SignupResponse } from '../api/auth';

interface AuthContextValue {
  user: User | null;
  usage: UsageStats | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<SignupResponse>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user from cookies
  const fetchUser = useCallback(async () => {
    try {
      const response = await authApi.me();
      setUser(response.user);
      setUsage(response.usage);
      return true;
    } catch {
      setUser(null);
      setUsage(null);
      return false;
    }
  }, []);

  // On mount, try to get user from existing cookies
  useEffect(() => {
    let mounted = true;

    fetchUser().finally(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setUser(response.user);
    // Fetch full usage stats after login
    try {
      const meResponse = await authApi.me();
      setUsage(meResponse.usage);
    } catch {
      // User data from login is sufficient
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<SignupResponse> => {
    const response = await authApi.register({ email, password, name });

    // If first user (auto-approved), fetch user data
    if (response.is_first_user) {
      await fetchUser();
    }

    return response;
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setUsage(null);
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchUser();
  };

  const value: AuthContextValue = {
    user,
    usage,
    loading,
    login,
    register,
    logout,
    refresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
