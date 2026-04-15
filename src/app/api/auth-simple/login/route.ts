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

    // Buscar usuario en la tabla simple
    console.log('Login attempt:', { email, password });
    
    const { data: user, error } = await supabase
      .from('usuarios_simple')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('activo', true)
      .single();

    console.log('User query result:', { user, error });

    if (error || !user) {
      console.log('User not found:', { email, error, user });
      return NextResponse.json(
        { error: 'Usuario no encontrado', debug: { email, error, user } },
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

    // Crear sesión simple (sin perfil en user_profiles por ahora)
    const session = {
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
      },
      profile: null, // No hay perfil en user_profiles
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
