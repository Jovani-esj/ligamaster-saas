'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import Link from 'next/link';

interface UserProfile {
  id: string;
  user_id: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  rol: 'superadmin' | 'admin_liga' | 'usuario';
  liga_id?: string;
  activo: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<boolean>;
  signInWithFacebook: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdminLiga: boolean;
  hasPaidAccess: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthenticationProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión inicial
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Error al iniciar sesión: ' + error.message);
        return false;
      }

      if (data.user) {
        toast.success('¡Sesión iniciada correctamente!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Error inesperado al iniciar sesión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: Partial<UserProfile>
  ): Promise<boolean> => {
    try {
      setLoading(true);

      // Validaciones básicas
      if (!email || !password) {
        toast.error('Email y contraseña son requeridos');
        return false;
      }

      if (password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return false;
      }

      // 1. Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: userData.nombre || '',
            apellido: userData.apellido || '',
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast.error('Error al registrar usuario: ' + authError.message);
        return false;
      }

      if (authData.user) {
        // 2. Crear perfil extendido con manejo de errores mejorado
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([{
              user_id: authData.user.id,
              nombre: userData.nombre || '',
              apellido: userData.apellido || '',
              telefono: userData.telefono || null,
              fecha_nacimiento: userData.fecha_nacimiento || null,
              rol: userData.rol || 'usuario',
              liga_id: userData.liga_id || null,
            }]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
            
            // Si el error es por tabla no existente, dar mensaje específico
            if (profileError.message.includes('relation') || profileError.message.includes('does not exist')) {
              toast.error('La tabla de perfiles no existe. Por favor, ejecuta el script SQL primero.');
            } else {
              toast.error('Error al crear perfil: ' + profileError.message);
            }
            return false;
          }

          toast.success('¡Usuario registrado correctamente! Por favor, verifica tu email para confirmar la cuenta.');
          return true;
        } catch (profileCreationError) {
          console.error('Profile creation exception:', profileCreationError);
          toast.error('Error al crear perfil de usuario. Intenta de nuevo más tarde.');
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Signup error:', error);
      
      // Manejar diferentes tipos de errores
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Error de conexión. Verifica tu conexión a internet.');
      } else if (error instanceof Error) {
        toast.error('Error inesperado: ' + error.message);
      } else {
        toast.error('Error inesperado al registrar usuario');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async (): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        console.error('Facebook auth error:', error);
        toast.error('Error al autenticar con Facebook: ' + error.message);
        return false;
      }

      // OAuth redirect will handle the rest
      return true;
    } catch (error) {
      console.error('Facebook sign in error:', error);
      toast.error('Error inesperado al autenticar con Facebook');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    try {
      if (!user) {
        toast.error('No hay usuario autenticado');
        return false;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Error al actualizar perfil: ' + error.message);
        return false;
      }

      // Refrescar perfil
      await fetchUserProfile(user.id);
      toast.success('Perfil actualizado correctamente');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error inesperado al actualizar perfil');
      return false;
    }
  };

  // Verificar si el usuario tiene acceso según el estado de pago
  const checkPaidAccess = async (): Promise<boolean> => {
    if (!profile?.liga_id) return false;

    try {
      const { data: liga, error } = await supabase
        .from('ligas')
        .select('estatus_pago, activa')
        .eq('id', profile.liga_id)
        .single();

      if (error || !liga) return false;

      return liga.estatus_pago && liga.activa;
    } catch (error) {
      console.error('Error checking paid access:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signInWithFacebook,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isSuperAdmin: profile?.rol === 'superadmin',
    isAdminLiga: profile?.rol === 'admin_liga',
    hasPaidAccess: profile ? checkPaidAccess : async () => false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthenticationProvider');
  }
  return context;
}

// Componente de protección para rutas autenticadas
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
  requirePaidAccess?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireSuperAdmin = false, 
  requirePaidAccess = false,
  fallback 
}: ProtectedRouteProps) {
  const { 
    isAuthenticated, 
    isSuperAdmin, 
    hasPaidAccess, 
    loading 
  } = useAuth();

  // Verificar acceso de pago si es requerido
  const [paidAccess, setPaidAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(false);
  
  useEffect(() => {
    const checkAccess = async () => {
      if (requirePaidAccess && isAuthenticated) {
        setCheckingAccess(true);
        try {
          const hasAccess = await hasPaidAccess();
          setPaidAccess(hasAccess);
        } catch (error) {
          console.error('Error checking paid access:', error);
          setPaidAccess(false);
        } finally {
          setCheckingAccess(false);
        }
      } else if (!requirePaidAccess) {
        setPaidAccess(true);
      }
    };

    checkAccess();
  }, [requirePaidAccess, isAuthenticated, hasPaidAccess]);

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {checkingAccess ? 'Verificando estado de pago...' : 'Verificando acceso...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Requerido</h1>
            <p className="text-gray-600 mb-6">
              Debes iniciar sesión para acceder a esta sección.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Restringido</h1>
            <p className="text-gray-600 mb-6">
              Se requieren permisos de SuperAdmin para acceder a esta sección.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (requirePaidAccess && paidAccess === false) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Suspendido</h1>
            <p className="text-gray-600 mb-6">
              Tu liga se encuentra suspendida por falta de pago. Contacta al administrador para regularizar tu situación.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
