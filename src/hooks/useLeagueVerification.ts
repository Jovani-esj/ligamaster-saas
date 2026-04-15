'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface LeagueInfo {
  slug: string;
  nombre_liga: string;
  plan: string;
  estatus_pago: boolean;
  activa: boolean;
}

interface VerificationResult {
  success: boolean;
  liga?: LeagueInfo;
  error?: string;
  redirect?: string;
}

export function useLeagueVerification() {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Rutas que no requieren verificación de liga - memoized to prevent re-renders
  const publicRoutes = useMemo(() => [
    '/',
    '/ligas',
    '/liga',
    '/auth/login',
    '/auth/register',
    '/auth/signup',
    '/auth/registrarse',
    '/auth/iniciar-sesion',
    '/auth/recuperar-contraseña',
    '/auth/restablecer-contraseña',
    '/auth/callback',
    '/auth/simple-login',
    '/auth/simple-register',
    '/dashboard',
    '/admin',
    '/admin-admin',
    '/buscar',
    '/mis-ligas',
    '/perfil',
    '/configuracion',
    '/crear-liga',
    '/roles-juego',
    '/equipos',
    '/liga-no-encontrada',
    '/liga-inactiva',
    '/liga-suspendida'
  ], []);

  // Extraer el slug de la URL para rutas dinámicas de ligas
  const slugMatch = pathname.match(/^\/([^\/]+)/);
  const slug = slugMatch ? slugMatch[1] : null;

  // Determinar si se necesita verificación
  const needsVerification = useMemo(() => {
    // Si es una ruta API, no verificar
    if (pathname.startsWith('/api/')) return false;
    
    // Si es una ruta /liga/, no verificar (rutas públicas de visualización)
    if (pathname.startsWith('/liga/')) return false;
    
    // Si es una ruta pública o no hay slug, no verificar
    if (publicRoutes.includes(pathname) || !slug) return false;
    
    // Si es una ruta de assets o archivos estáticos, no verificar
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) return false;
    
    return true;
  }, [pathname, slug, publicRoutes]);

  useEffect(() => {
    // Si no necesita verificación, establecer éxito inmediatamente
    if (!needsVerification) {
      setVerificationResult({ success: true });
      return;
    }

    const verifyLeague = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/verify-league?slug=${slug}`);
        const data = await response.json();

        if (data.success) {
          setVerificationResult({ success: true, liga: data.liga });
        } else {
          setVerificationResult({ success: false, error: data.error, redirect: data.redirect });
          // Redirigir automáticamente si hay una redirección especificada
          if (data.redirect) {
            router.push(data.redirect);
          }
        }
      } catch (error) {
        console.error('Error verificando liga:', error);
        setVerificationResult({ success: false, error: 'Error de conexión' });
      } finally {
        setLoading(false);
      }
    };

    verifyLeague();
  }, [needsVerification, slug, router]);

  return { verificationResult, loading, slug };
}
