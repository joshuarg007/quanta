// AuthProvider context for QUANTA
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, clearTokens, getAccessToken } from '../api/auth';
import type { User } from '../api/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token and hydrate user
  useEffect(() => {
    let mounted = true;
    const token = getAccessToken();

    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((u) => {
        if (mounted) setUser(u);
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
          clearTokens();
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setUser(response.user);
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await authApi.register({ email, password, name });
    setUser(response.user);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const value: AuthContextValue = { user, loading, login, register, logout };

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
