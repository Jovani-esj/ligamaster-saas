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
    const body = await request.json();
    const { 
      email, 
      password, 
      nombre, 
      apellido, 
      rol = 'usuario',
      telefono = null,
      fecha_nacimiento = null,
      deporte_preferido = null,
      nivel_juego = null,
      equipo_interes = null,
      posicion_preferida = null,
      // Info de la liga (solo para rol admin_liga)
      nombre_liga,
      slug_liga,
      descripcion_liga,
      plan_liga = 'Bronce',
      monto_pago = '0',
      referencia_pago
    } = body;

    if (!email || !password || !nombre) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre son requeridos' },
        { status: 400 }
      );
    }

    // Inicializar Supabase con helper de fallback
    const supabase = await getSupabaseClient();

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('usuarios_simple')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // 1. Crear nuevo usuario en usuarios_simple
    const { data: newUser, error: insertError } = await supabase
      .from('usuarios_simple')
      .insert([{
        email: email.toLowerCase(),
        password: password, // Texto plano para pruebas
        nombre: nombre,
        apellido: apellido || '',
        rol: rol,
        activo: true,
        telefono,
        fecha_nacimiento,
        deporte_preferido,
        nivel_juego,
        equipo_interes,
        posicion_preferida
      }])
      .select()
      .single();

    if (insertError || !newUser) {
      console.error('Error creating user:', insertError);
      return NextResponse.json(
        { error: 'Error al crear usuario en la base de datos' },
        { status: 500 }
      );
    }

    let createdLiga = null;

    // 2. Si el rol es admin_liga, crear la liga y registrar el pago correspondiente
    if (rol === 'admin_liga' && nombre_liga && slug_liga) {
      // Verificar si el slug ya existe
      const { data: existingSlug } = await supabase
        .from('ligas')
        .select('slug')
        .eq('slug', slug_liga)
        .maybeSingle();

      const finalSlug = existingSlug 
        ? `${slug_liga}-${Math.random().toString(36).substring(2, 5)}`
        : slug_liga;

      const { data: newLiga, error: ligaError } = await supabase
        .from('ligas')
        .insert([{
          nombre_liga,
          slug: finalSlug,
          descripcion: descripcion_liga || '',
          owner_id: newUser.id,
          estatus_pago: true, // Se registra con pago aprobado
          plan: plan_liga,
          activa: true,
          fecha_registro: new Date().toISOString(),
          fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días de suscripción
        }])
        .select()
        .single();

      if (ligaError) {
        console.error('Error creating liga during registration:', ligaError);
        // Si hay error al crear la liga, igual dejamos el usuario pero notificamos el error
      } else {
        createdLiga = newLiga;

        // Registrar el pago en la tabla pagos
        const { error: pagoError } = await supabase
          .from('pagos')
          .insert([{
            liga_id: newLiga.id,
            monto: parseFloat(monto_pago || '0'),
            metodo_pago: 'tarjeta',
            estatus: 'completado',
            referencia: referencia_pago || `sim_ref_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            meses_contratados: 1,
            fecha_pago: new Date().toISOString()
          }]);

        if (pagoError) {
          console.error('Error creating payment record:', pagoError);
        }
      }
    }

    // 3. Crear sesión automáticamente con datos de perfil fallback estructurados
    const profile = {
      id: newUser.id,
      user_id: newUser.id,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      rol: newUser.rol,
      activo: newUser.activo,
      liga_id: createdLiga?.id || null,
      equipo_id: null,
      es_capitan_equipo: false,
      telefono: newUser.telefono,
      fecha_nacimiento: newUser.fecha_nacimiento,
      deporte_preferido: newUser.deporte_preferido,
      nivel_juego: newUser.nivel_juego,
      equipo_interes: newUser.equipo_interes,
      posicion_preferida: newUser.posicion_preferida,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    };

    const session = {
      user: {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        rol: newUser.rol,
      },
      profile,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado correctamente',
      session,
      user: session.user,
      profile: session.profile,
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Error interno en el servidor' },
      { status: 500 }
    );
  }
}
