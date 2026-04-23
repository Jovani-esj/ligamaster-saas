import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
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
      return NextResponse.json(
        { error: 'Liga no encontrada', redirect: '/liga-no-encontrada' },
        { status: 404 }
      );
    }

    // Si la liga no está activa, redirigir a página de liga inactiva
    if (!liga.activa) {
      return NextResponse.json(
        { error: 'Liga inactiva', redirect: '/liga-inactiva' },
        { status: 403 }
      );
    }

    // Si la liga no está pagada, redirigir a página de suspensión
    if (!liga.estatus_pago) {
      return NextResponse.json(
        { error: 'Liga suspendida', redirect: '/liga-suspendida' },
        { status: 403 }
      );
    }

    // Si todo está en orden, retornar información de la liga
    return NextResponse.json({
      success: true,
      liga: {
        slug,
        nombre_liga: liga.nombre_liga,
        plan: liga.plan,
        estatus_pago: liga.estatus_pago,
        activa: liga.activa
      }
    });

  } catch (error) {
    console.error('Error en verificación de liga:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
