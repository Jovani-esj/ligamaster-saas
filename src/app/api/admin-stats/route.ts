import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    // Obtener todas las ligas (sin restricciones RLS usando service role)
    const { data: ligasData, error: ligasError } = await supabaseServer
      .from('ligas')
      .select('*')
      .order('created_at', { ascending: false });

    if (ligasError) {
      console.error('Error fetching ligas:', ligasError);
      return NextResponse.json(
        { error: 'Error fetching ligas', details: ligasError.message },
        { status: 500 }
      );
    }

    // Obtener estadísticas para cada liga
    const ligasConEstadisticas = await Promise.all(
      (ligasData || []).map(async (liga) => {
        const { data: stats } = await supabaseServer
          .from('vista_estadisticas_liga')
          .select('*')
          .eq('liga_id', liga.id)
          .single();

        // Obtener información del owner
        let owner = null;
        if (liga.owner_id) {
          const { data: ownerData } = await supabaseServer
            .from('user_profiles')
            .select('nombre, apellido, email')
            .eq('user_id', liga.owner_id)
            .single();
          owner = ownerData;
        }

        return {
          ...liga,
          owner,
          estadisticas: stats || {
            total_equipos: 0,
            total_jugadores: 0,
            total_partidos: 0,
            partidos_jugados: 0
          }
        };
      })
    );

    // Obtener todos los usuarios
    const { data: usuariosData, error: usuariosError } = await supabaseServer
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usuariosError) {
      console.error('Error fetching usuarios:', usuariosError);
      return NextResponse.json(
        { error: 'Error fetching usuarios', details: usuariosError.message },
        { status: 500 }
      );
    }

    // Calcular estadísticas generales
    const estadisticas = {
      totalLigas: ligasConEstadisticas.length,
      ligasActivas: ligasConEstadisticas.filter((l: { activa: boolean }) => l.activa).length,
      ligasPagadas: ligasConEstadisticas.filter((l: { estatus_pago: boolean }) => l.estatus_pago).length,
      totalUsuarios: usuariosData?.length || 0,
      totalEquipos: ligasConEstadisticas.reduce((sum: number, l: { estadisticas?: { total_equipos: number } }) => 
        sum + (l.estadisticas?.total_equipos || 0), 0),
      totalJugadores: ligasConEstadisticas.reduce((sum: number, l: { estadisticas?: { total_jugadores: number } }) => 
        sum + (l.estadisticas?.total_jugadores || 0), 0),
      totalPartidos: ligasConEstadisticas.reduce((sum: number, l: { estadisticas?: { total_partidos: number } }) => 
        sum + (l.estadisticas?.total_partidos || 0), 0)
    };

    return NextResponse.json({
      ligas: ligasConEstadisticas,
      usuarios: usuariosData || [],
      estadisticas
    });

  } catch (error) {
    console.error('Error in admin-stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
