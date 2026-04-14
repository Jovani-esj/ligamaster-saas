'use client';
import React from 'react';
import { supabase } from './supabase';

// Lista de emails de SuperAdmin (hardcodeado para simplicidad)
const SUPERADMIN_EMAILS = [
  'admin@ligamaster.com',
  'superadmin@ligamaster.com'
];

// Verificar si el usuario actual es SuperAdmin
export async function isCurrentUserSuperAdmin(): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }
    
    return SUPERADMIN_EMAILS.includes(user.email || '');
    
  } catch (error) {
    console.error('Error verificando rol de SuperAdmin:', error);
    return false;
  }
}

// Verificar si un email específico es SuperAdmin
export function isSuperAdminEmail(email: string): boolean {
  return SUPERADMIN_EMAILS.includes(email);
}

// Hook personalizado para verificar si el usuario es SuperAdmin
export function useSuperAdmin() {
  const [isSuperAdmin, setIsSuperAdmin] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const authorized = await isCurrentUserSuperAdmin();
        setIsSuperAdmin(authorized);
      } catch (error) {
        console.error('Error en verificación de autorización:', error);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isSuperAdmin, loading };
}

// Componente de protección para rutas de SuperAdmin
interface ProtectedComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SuperAdminProtection({ children, fallback }: ProtectedComponentProps) {
  const { isSuperAdmin, loading } = useSuperAdmin();

  if (loading) {
    return React.createElement(
      'div',
      { className: 'min-h-screen flex items-center justify-center' },
      React.createElement(
        'div',
        { className: 'text-center' },
        React.createElement('div', {
          className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'
        }),
        React.createElement(
          'p',
          { className: 'text-gray-600' },
          'Verificando permisos...'
        )
      )
    );
  }

  if (!isSuperAdmin) {
    return fallback || React.createElement(
      'div',
      { className: 'min-h-screen flex items-center justify-center' },
      React.createElement(
        'div',
        { className: 'max-w-md w-full bg-white rounded-lg shadow-lg p-8' },
        React.createElement(
          'div',
          { className: 'text-center' },
          React.createElement(
            'h1',
            { className: 'text-2xl font-bold text-red-600 mb-4' },
            'Acceso No Autorizado'
          ),
          React.createElement(
            'p',
            { className: 'text-gray-600 mb-6' },
            'No tienes permisos para acceder a esta sección. Se requieren privilegios de SuperAdmin.'
          ),
          React.createElement(
            'a',
            {
              href: '/',
              className: 'inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            },
            'Volver al inicio'
          )
        )
      )
    );
  }

  return React.createElement(React.Fragment, null, children);
}
