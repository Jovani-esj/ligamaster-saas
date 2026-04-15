import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, password, nombre, apellido, rol = 'usuario' } = await request.json();

    if (!email || !password || !nombre) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre son requeridos' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('usuarios_simple')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Crear nuevo usuario
    const { data: newUser, error: insertError } = await supabase
      .from('usuarios_simple')
      .insert([{
        email: email.toLowerCase(),
        password: password, // Texto plano para pruebas
        nombre: nombre,
        apellido: apellido || '',
        rol: rol,
        activo: true,
      }])
      .select()
      .single();

    if (insertError || !newUser) {
      console.error('Error creating user:', insertError);
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      );
    }

    // Crear sesión automáticamente (sin perfil por ahora)
    const session = {
      user: {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        rol: newUser.rol,
      },
      profile: null, // No hay perfil en user_profiles
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Usuario creado correctamente',
      session,
      user: session.user,
      profile: session.profile,
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
