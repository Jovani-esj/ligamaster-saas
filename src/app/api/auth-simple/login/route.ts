import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Buscar usuario primero en usuarios_simple (tabla principal de usuarios)
    console.log('Login attempt:', { email, password });
    
    const { data: user, error: userError } = await supabase
      .from('usuarios_simple')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('activo', true)
      .single();

    console.log('User query result:', { user, userError });

    if (userError || !user) {
      console.log('User not found in usuarios_simple:', { email, userError, user });
      return NextResponse.json(
        { error: 'Usuario no encontrado', debug: { email, error: userError, user } },
        { status: 401 }
      );
    }

    // Verificar contraseña (texto plano)
    console.log('Password comparison:', { 
      provided: password, 
      stored: user.password, 
      match: user.password === password 
    });
    
    if (user.password !== password) {
      console.log('Password mismatch');
      return NextResponse.json(
        { error: 'Contraseña incorrecta', debug: { email, provided_password: password, stored_password: user.password } },
        { status: 401 }
      );
    }

    // Buscar perfil en user_profiles (si existe)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('Profile query result:', { profile, profileError });

    // Crear sesión con datos del usuario y perfil si existe
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
        liga_id: profile.liga_id,
        equipo_id: profile.equipo_id,
        es_capitan_equipo: profile.es_capitan_equipo,
        telefono: profile.telefono,
        fecha_nacimiento: profile.fecha_nacimiento,
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
        liga_id: null,
        equipo_id: null,
        es_capitan_equipo: false,
        telefono: null,
        fecha_nacimiento: null,
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
