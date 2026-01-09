'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, next?: string, plan?: string) => Promise<void>;
  signin: (email: string, password: string, next?: string, plan?: string) => Promise<void>;
  demoSignin: (next?: string, plan?: string) => Promise<void>;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem('nj_user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {
        localStorage.removeItem('nj_user');
      }
    }
    setLoading(false);
  }, []);

  const signup = async (email: string, password: string, next?: string, plan: string = 'Free') => {
    // Demo implementation: store user locally, including selected plan.
    const newUser = { id: `demo-${Date.now()}`, email, plan };
    localStorage.setItem('nj_user', JSON.stringify(newUser));
    setUser(newUser);
    if (next) {
      router.push(next);
    } else {
      router.push('/dashboard');
    }
  };

  const signin = async (email: string, password: string, next?: string, plan: string | undefined = undefined) => {
    // Demo signin - accept any credentials in demo mode, preserve plan if provided
    const existing = { id: `demo-${Date.now()}`, email, ...(plan ? { plan } : {}) };
    localStorage.setItem('nj_user', JSON.stringify(existing));
    setUser(existing);
    if (next) {
      router.push(next);
    } else {
      router.push('/dashboard');
    }
  };

  const demoSignin = async (next?: string, plan?: string) => {
    const demo = { id: 'demo-user', email: 'demo@demo.test', plan: plan || 'Free' };
    localStorage.setItem('nj_user', JSON.stringify(demo));
    setUser(demo);
    if (next) {
      router.push(next);
    } else {
      router.push('/dashboard');
    }
  };

  const signout = () => {
    localStorage.removeItem('nj_user');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, signin, demoSignin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
