'use client';
import { useEffect, useState } from 'react';
import { useSimpleAuth } from './SimpleAuthenticationSystem';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import Link from 'next/link';

interface RouteProtectionProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export default function RouteProtection({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  fallback 
}: RouteProtectionProps) {
  const { user, profile, loading } = useSimpleAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthorization = () => {
      // Si está cargando, esperar
      if (loading) {
        return;
      }

      // Si no requiere autenticación, permitir acceso
      if (!requireAuth) {
        setIsAuthorized(true);
        setCheckingAuth(false);
        return;
      }

      // Si requiere autenticación pero no hay usuario, denegar acceso
      if (!user || !profile) {
        setIsAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      // Si hay roles específicos requeridos, verificar
      if (allowedRoles.length > 0) {
        const hasRequiredRole = allowedRoles.includes(profile.rol);
        setIsAuthorized(hasRequiredRole);
      } else {
        // Si no hay roles específicos, solo requiere estar autenticado
        setIsAuthorized(true);
      }

      setCheckingAuth(false);
    };

    checkAuthorization();
  }, [user, profile, loading, requireAuth, allowedRoles]);

  // Estado de carga
  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // No autorizado
  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Mensaje específico según el motivo
    let errorMessage = {
      title: 'Acceso Restringido',
      description: 'No tienes permisos para acceder a esta página.',
      icon: Lock
    };

    if (!user) {
      errorMessage = {
        title: 'Autenticación Requerida',
        description: 'Debes iniciar sesión para acceder a esta página.',
        icon: Shield
      };
    } else if (allowedRoles.length > 0) {
      errorMessage = {
        title: 'Permisos Insuficientes',
        description: `Tu rol (${profile?.rol}) no tiene permisos para acceder a esta página. Roles permitidos: ${allowedRoles.join(', ')}.`,
        icon: AlertTriangle
      };
    }

    const Icon = errorMessage.icon;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Icon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {errorMessage.title}
            </h1>
            <p className="text-gray-600 mb-6">
              {errorMessage.description}
            </p>
            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Volver al Inicio
              </Link>
              {!user && (
                <Link
                  href="/auth/simple-login"
                  className="block w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Autorizado - mostrar contenido
  return <>{children}</>;
}

// Hook personalizado para protección de rutas
export function useRouteProtection(allowedRoles: string[] = [], requireAuth: boolean = true) {
  const { user, profile, loading } = useSimpleAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthorization = () => {
      if (loading) return;

      if (!requireAuth) {
        setIsAuthorized(true);
        setCheckingAuth(false);
        return;
      }

      if (!user || !profile) {
        setIsAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      if (allowedRoles.length > 0) {
        const hasRequiredRole = allowedRoles.includes(profile.rol);
        setIsAuthorized(hasRequiredRole);
      } else {
        setIsAuthorized(true);
      }

      setCheckingAuth(false);
    };

    checkAuthorization();
  }, [user, profile, loading, requireAuth, allowedRoles]);

  return { isAuthorized, checkingAuth };
}
