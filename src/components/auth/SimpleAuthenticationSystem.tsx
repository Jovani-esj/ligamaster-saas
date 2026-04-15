'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Tipos
interface SimpleUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
}

interface SimpleProfile {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  rol: string;
  activo: boolean;
  liga_id?: string;
  equipo_id?: string;
  es_capitan_equipo: boolean;
  telefono?: string;
  fecha_nacimiento?: string;
  created_at: string;
  updated_at: string;
}

interface SimpleSession {
  user: SimpleUser;
  profile: SimpleProfile | null;
  expires_at: string;
}

interface SimpleAuthContextType {
  user: SimpleUser | null;
  profile: SimpleProfile | null;
  session: SimpleSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, nombre: string, apellido?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [profile, setProfile] = useState<SimpleProfile | null>(null);
  const [session, setSession] = useState<SimpleSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión desde localStorage al iniciar
  useEffect(() => {
    const loadSession = () => {
      try {
        const savedSession = localStorage.getItem('simpleAuthSession');
        if (savedSession) {
          const parsedSession: SimpleSession = JSON.parse(savedSession);
          
          // Verificar si la sesión no ha expirado
          if (new Date(parsedSession.expires_at) > new Date()) {
            setSession(parsedSession);
            setUser(parsedSession.user);
            setProfile(parsedSession.profile);
          } else {
            // Sesión expirada, limpiar
            localStorage.removeItem('simpleAuthSession');
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
        localStorage.removeItem('simpleAuthSession');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Guardar sesión en localStorage cuando cambie
  useEffect(() => {
    if (session) {
      localStorage.setItem('simpleAuthSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('simpleAuthSession');
    }
  }, [session]);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth-simple/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSession(data.session);
        setUser(data.user);
        setProfile(data.profile);
        return true;
      } else {
        console.error('Login failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    nombre: string, 
    apellido?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth-simple/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, nombre, apellido }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSession(data.session);
        setUser(data.user);
        setProfile(data.profile);
        return true;
      } else {
        console.error('Registration failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setSession(null);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('simpleAuthSession');
    } catch (error) {
      console.error('SignOut error:', error);
    }
  }, []);

  const value: SimpleAuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}
