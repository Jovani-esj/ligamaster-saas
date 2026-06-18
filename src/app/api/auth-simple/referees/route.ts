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
      console.warn('Referees API: SUPABASE_SERVICE_ROLE_KEY es inválida. Usando clave anónima...');
      cachedSupabaseClient = createClient(url, anonKey);
    } else {
      cachedSupabaseClient = serviceClient;
    }
  } catch (err) {
    cachedSupabaseClient = createClient(url, anonKey);
  }
  return cachedSupabaseClient;
}

// GET: Obtener todos los árbitros de una liga
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ligaId = searchParams.get('ligaId');

    if (!ligaId) {
      return NextResponse.json(
        { error: 'El ID de la liga (ligaId) es requerido' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseClient();

    const { data: arbitros, error } = await supabase
      .from('usuarios_simple')
      .select('id, email, nombre, apellido, rol, activo, created_at, liga_id')
      .eq('liga_id', ligaId)
      .eq('rol', 'arbitro')
      .order('nombre');

    if (error) {
      console.error('Error fetching referees:', error);
      return NextResponse.json(
        { error: 'Error al obtener los árbitros de la base de datos' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, arbitros: arbitros || [] });
  } catch (error) {
    console.error('Referees GET error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Registrar un nuevo árbitro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nombre, apellido, ligaId } = body;

    if (!email || !password || !nombre || !ligaId) {
      return NextResponse.json(
        { error: 'Email, contraseña, nombre y ligaId son requeridos' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseClient();

    // Verificar si el correo ya existe
    const { data: existingUser } = await supabase
      .from('usuarios_simple')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    // Insertar nuevo árbitro en usuarios_simple
    const { data: newReferee, error: insertError } = await supabase
      .from('usuarios_simple')
      .insert([{
        email: email.toLowerCase(),
        password: password, // Contraseña en texto plano para desarrollo
        nombre: nombre,
        apellido: apellido || '',
        rol: 'arbitro',
        activo: true,
        liga_id: ligaId
      }])
      .select('id, email, nombre, apellido, rol, activo, created_at, liga_id')
      .single();

    if (insertError || !newReferee) {
      console.error('Error creating referee:', insertError);
      return NextResponse.json(
        { error: 'Error al registrar el árbitro en la base de datos' },
        { status: 500 }
      );
    }

    // También creamos un registro correspondiente en user_profiles si existe esa tabla para coherencia
    try {
      await supabase
        .from('user_profiles')
        .insert([{
          user_id: newReferee.id, // usamos el mismo ID en simple-auth
          nombre: nombre,
          apellido: apellido || '',
          rol: 'arbitro',
          liga_id: ligaId,
          activo: true
        }]);
    } catch (profileErr) {
      // No crítico, user_profiles se sincroniza también al iniciar sesión
      console.warn('No se pudo crear perfil secundario en user_profiles (puede no ser crítico):', profileErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Árbitro registrado exitosamente',
      referee: newReferee
    });
  } catch (error) {
    console.error('Referees POST error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
