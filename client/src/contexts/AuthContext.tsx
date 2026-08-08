// ============================================
// BrandForge AI — Auth Context
// ============================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthToken, setAuthToken, removeAuthToken, fetchWithAuth } from '../lib/api';

export interface User {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (!getAuthToken()) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetchWithAuth('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        removeAuthToken();
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error } };
      
      setAuthToken(data.token);
      setUser(data.user);
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error } };
      
      setAuthToken(data.token);
      setUser(data.user);
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message } };
    }
  };

  const signOut = async () => {
    removeAuthToken();
    setUser(null);
  };

  const getToken = () => getAuthToken();

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
