import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let cachedSupabaseClient: any = null;

async function getSupabaseClient() {
  if (cachedSupabaseClient) return cachedSupabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!serviceKey) {
    cachedSupabaseClient = createClient(url, anonKey);
    return cachedSupabaseClient;
  }

  const serviceClient = createClient(url, serviceKey);
  try {
    const { error } = await serviceClient.from('ligas').select('id').limit(1);
    if (error && error.message.includes('Invalid API key')) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY es inválida. Usando clave anónima (anon key)...');
      cachedSupabaseClient = createClient(url, anonKey);
    } else {
      cachedSupabaseClient = serviceClient;
    }
  } catch (err) {
    cachedSupabaseClient = createClient(url, anonKey);
  }
  return cachedSupabaseClient;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseClient();

    // Buscar usuario primero en usuarios_simple (tabla principal de usuarios)
    console.log('Login attempt:', { email, password });
    
    const { data: user, error: userError } = await supabase
      .from('usuarios_simple')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('activo', true)
      .maybeSingle();

    console.log('User query result:', { user, userError });

    if (userError || !user) {
      console.log('User not found in usuarios_simple:', { email, userError, user });
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    // Verificar contraseña (texto plano)
    if (user.password !== password) {
      console.log('Password mismatch');
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Si el rol es admin_liga, buscar su liga asociada en la tabla de ligas
    let adminLigaId = null;
    if (user.rol === 'admin_liga') {
      const { data: liga } = await supabase
        .from('ligas')
        .select('id')
        .eq('owner_id', user.id)
        .order('fecha_registro', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (liga) {
        adminLigaId = liga.id;
      }
    }

    // Buscar perfil en user_profiles (si existe - para compatibilidad)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('Profile query result:', { profile, profileError });

    // Crear sesión con datos del usuario y perfil
    const session = {
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
      },
      profile: profile ? {
        id: profile.id,
        user_id: profile.user_id,
        nombre: profile.nombre,
        apellido: profile.apellido,
        rol: profile.rol,
        activo: profile.activo,
        liga_id: profile.liga_id || adminLigaId,
        equipo_id: profile.equipo_id,
        es_capitan_equipo: profile.es_capitan_equipo,
        telefono: profile.telefono || user.telefono,
        fecha_nacimiento: profile.fecha_nacimiento || user.fecha_nacimiento,
        deporte_preferido: user.deporte_preferido || null,
        nivel_juego: user.nivel_juego || null,
        equipo_interes: user.equipo_interes || null,
        posicion_preferida: user.posicion_preferida || null,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      } : {
        // Fallback profile if not found in user_profiles
        id: user.id,
        user_id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        activo: user.activo,
        liga_id: adminLigaId,
        equipo_id: null,
        es_capitan_equipo: false,
        telefono: user.telefono || null,
        fecha_nacimiento: user.fecha_nacimiento || null,
        deporte_preferido: user.deporte_preferido || null,
        nivel_juego: user.nivel_juego || null,
        equipo_interes: user.equipo_interes || null,
        posicion_preferida: user.posicion_preferida || null,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
    };

    return NextResponse.json({
      success: true,
      session,
      user: session.user,
      profile: session.profile,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

