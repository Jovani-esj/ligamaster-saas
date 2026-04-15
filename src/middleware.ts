import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Si es una ruta API, permitir acceso inmediatamente
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Si es una ruta /liga/, permitir acceso (estas son rutas públicas de visualización)
  if (pathname.startsWith('/liga/')) {
    return NextResponse.next();
  }
  
  // Extraer el slug de la URL para rutas dinámicas de ligas
  // Ejemplo: /liga-toluca/dashboard -> slug = "liga-toluca"
  const slugMatch = pathname.match(/^\/([^\/]+)/);
  const slug = slugMatch ? slugMatch[1] : null;

  // Rutas que no requieren verificación de liga
  const publicRoutes = [
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
    '/admin',
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
  ];

  // Si es una ruta pública o no hay slug, permitir acceso
  if (publicRoutes.includes(pathname) || !slug) {
    return NextResponse.next();
  }

  // Si es una ruta de assets o archivos estáticos, permitir acceso
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next();
  }

  try {
    // Crear cliente de Supabase con rol de servicio para bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar el estatus de la liga
    const { data: liga, error } = await supabase
      .from('ligas')
      .select('estatus_pago, activa, nombre_liga, plan')
      .eq('slug', slug)
      .single();

    if (error || !liga) {
      // Si la liga no existe, redirigir a página de no encontrado
      return NextResponse.redirect(new URL('/liga-no-encontrada', request.url));
    }

    // Si la liga no está activa, redirigir a página de liga inactiva
    if (!liga.activa) {
      const suspensionUrl = new URL('/liga-inactiva', request.url);
      return NextResponse.redirect(suspensionUrl);
    }

    // Si la liga no está pagada, redirigir a página de suspensión
    if (!liga.estatus_pago) {
      const suspensionUrl = new URL('/liga-suspendida', request.url);
      return NextResponse.redirect(suspensionUrl);
    }

    // Si todo está en orden, permitir acceso y añadir headers de información
    const response = NextResponse.next();
    response.headers.set('x-liga-slug', slug);
    response.headers.set('x-liga-nombre', liga.nombre_liga);
    response.headers.set('x-liga-plan', liga.plan);
    
    return response;
  } catch (error) {
    console.error('Error en middleware de verificación de liga:', error);
    
    // En caso de error, permitir acceso para no bloquear el sistema
    return NextResponse.next();
  }
}
