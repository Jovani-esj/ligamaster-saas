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

// Segmentos de ruta raíz estáticos del sistema que NO deben tratarse como slugs de ligas dinámicas
const staticRootSegments = new Set([
  'admin',
  'admin-admin',
  'api',
  'aprobaciones',
  'auth',
  'buscar',
  'calendario',
  'canchas',
  'check-users',
  'configuracion',
  'configuracion-sistema',
  'crear-liga',
  'create-admin',
  'dashboard',
  'debug-dashboard',
  'debug-roles',
  'equipos',
  'gestion-jugadores',
  'gestion-ligas',
  'liga',
  'liga-inactiva',
  'liga-no-encontrada',
  'liga-suspendida',
  'ligas',
  'mis-ligas',
  'perfil',
  'reportes',
  'roles-juego'
]);

export function useLeagueVerification() {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Extraer el slug de la URL para rutas dinámicas de ligas (el primer segmento de la ruta)
  const slugMatch = pathname.match(/^\/([^\/]+)/);
  const slug = slugMatch ? slugMatch[1] : null;

  // Determinar si se necesita verificación
  const needsVerification = useMemo(() => {
    // Si es una ruta de API, no verificar
    if (pathname.startsWith('/api/')) return false;
    
    // Si es una ruta de assets o archivos estáticos, no verificar
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) return false;
    
    // Si no hay slug (ej: la raíz "/") o el segmento pertenece a una ruta estática conocida, no verificar
    if (!slug || staticRootSegments.has(slug)) return false;
    
    return true;
  }, [pathname, slug]);

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

