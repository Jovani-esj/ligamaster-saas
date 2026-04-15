// Funciones de base de datos para LigaMaster SaaS
import { supabase } from './supabase';
import { 
  Liga, 
  Equipo, 
  Jugador, 
  Torneo, 
  Partido, 
  Cancha, 
  UserProfile,
  ConfiguracionTemporada,
  EstadisticasLiga,
  EstadisticasEquipo,
  CreateLigaData,
  CreateEquipoData,
  CreateJugadorData,
  CreateTorneoData,
  CreateCanchaData,
  CreateConfiguracionTemporadaData
} from '@/types/database';

// ========================================
// LIGAS
// ========================================

export async function getLigas(userId?: string): Promise<Liga[]> {
  let query = supabase.from('ligas').select('*');
  
  if (userId) {
    // Si se proporciona userId, obtener ligas donde el usuario es owner o tiene perfil
    query = query.or(`owner_id.eq.${userId},id.in.(SELECT liga_id FROM user_profiles WHERE user_id.eq.${userId})`);
  }
  
  const { data, error } = await query.order('fecha_registro', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getLiga(id: string): Promise<Liga | null> {
  const { data, error } = await supabase
    .from('ligas')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createLiga(data: CreateLigaData, owner_id: string): Promise<Liga> {
  // Generar slug único
  const slug = data.nombre_liga
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const { data: liga, error } = await supabase
    .from('ligas')
    .insert([{
      ...data,
      slug,
      owner_id,
      fecha_vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año
    }])
    .select()
    .single();
    
  if (error) throw error;
  return liga;
}

export async function updateLiga(id: string, data: Partial<Liga>): Promise<Liga> {
  const { data: liga, error } = await supabase
    .from('ligas')
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return liga;
}

export async function deleteLiga(id: string): Promise<void> {
  const { error } = await supabase
    .from('ligas')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// ========================================
// EQUIPOS
// ========================================

export async function getEquipos(liga_id: string): Promise<Equipo[]> {
  const { data, error } = await supabase
    .from('equipos')
    .select('*')
    .eq('liga_id', liga_id)
    .order('nombre');
    
  if (error) throw error;
  return data || [];
}

export async function getEquipo(id: string): Promise<Equipo | null> {
  const { data, error } = await supabase
    .from('equipos')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createEquipo(data: CreateEquipoData, liga_id: string): Promise<Equipo> {
  const { data: equipo, error } = await supabase
    .from('equipos')
    .insert([{
      ...data,
      liga_id,
    }])
    .select()
    .single();
    
  if (error) throw error;
  return equipo;
}

export async function updateEquipo(id: string, data: Partial<Equipo>): Promise<Equipo> {
  const { data: equipo, error } = await supabase
    .from('equipos')
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return equipo;
}

export async function deleteEquipo(id: string): Promise<void> {
  const { error } = await supabase
    .from('equipos')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// ========================================
// JUGADORES
// ========================================

export async function getJugadores(equipo_id: string): Promise<Jugador[]> {
  const { data, error } = await supabase
    .from('jugadores')
    .select('*')
    .eq('equipo_id', equipo_id)
    .order('numero_camiseta', { ascending: true, nullsFirst: false });
    
  if (error) throw error;
  return data || [];
}

export async function getJugador(id: string): Promise<Jugador | null> {
  const { data, error } = await supabase
    .from('jugadores')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createJugador(data: CreateJugadorData, equipo_id: string): Promise<Jugador> {
  const { data: jugador, error } = await supabase
    .from('jugadores')
    .insert([{
      ...data,
      equipo_id,
      fecha_registro: new Date().toISOString(),
    }])
    .select()
    .single();
    
  if (error) throw error;
  return jugador;
}

export async function updateJugador(id: string, data: Partial<Jugador>): Promise<Jugador> {
  const { data: jugador, error } = await supabase
    .from('jugadores')
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return jugador;
}

export async function deleteJugador(id: string): Promise<void> {
  const { error } = await supabase
    .from('jugadores')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// ========================================
// TORNEOS
// ========================================

export async function getTorneos(liga_id: string): Promise<Torneo[]> {
  const { data, error } = await supabase
    .from('torneos')
    .select('*')
    .eq('liga_id', liga_id)
    .order('nombre');
    
  if (error) throw error;
  return data || [];
}

export async function getTorneo(id: string): Promise<Torneo | null> {
  const { data, error } = await supabase
    .from('torneos')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createTorneo(data: CreateTorneoData, liga_id: string): Promise<Torneo> {
  const { data: torneo, error } = await supabase
    .from('torneos')
    .insert([{
      ...data,
      liga_id,
    }])
    .select()
    .single();
    
  if (error) throw error;
  return torneo;
}

export async function updateTorneo(id: string, data: Partial<Torneo>): Promise<Torneo> {
  const { data: torneo, error } = await supabase
    .from('torneos')
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return torneo;
}

export async function deleteTorneo(id: string): Promise<void> {
  const { error } = await supabase
    .from('torneos')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// ========================================
// PARTIDOS
// ========================================

export async function getPartidos(torneo_id: string): Promise<Partido[]> {
  const { data, error } = await supabase
    .from('partidos')
    .select('*')
    .eq('torneo_id', torneo_id)
    .order('fecha_jornada', { ascending: true });
    
  if (error) throw error;
  return data || [];
}

export async function getPartidosPorLiga(liga_id: string): Promise<Partido[]> {
  const { data, error } = await supabase
    .from('partidos')
    .select('*')
    .eq('liga_id', liga_id)
    .order('fecha_jornada', { ascending: true });
    
  if (error) throw error;
  return data || [];
}

export async function getPartido(id: string): Promise<Partido | null> {
  const { data, error } = await supabase
    .from('partidos')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createPartido(data: Partial<Partido>): Promise<Partido> {
  const { data: partido, error } = await supabase
    .from('partidos')
    .insert([data])
    .select()
    .single();
    
  if (error) throw error;
  return partido;
}

export async function updatePartido(id: string, data: Partial<Partido>): Promise<Partido> {
  const { data: partido, error } = await supabase
    .from('partidos')
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return partido;
}

export async function deletePartido(id: string): Promise<void> {
  const { error } = await supabase
    .from('partidos')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// ========================================
// CANCHAS
// ========================================

export async function getCanchas(liga_id: string): Promise<Cancha[]> {
  const { data, error } = await supabase
    .from('canchas')
    .select('*')
    .eq('liga_id', liga_id)
    .order('nombre');
    
  if (error) throw error;
  return data || [];
}

export async function getCancha(id: string): Promise<Cancha | null> {
  const { data, error } = await supabase
    .from('canchas')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createCancha(data: CreateCanchaData, liga_id: string): Promise<Cancha> {
  const { data: cancha, error } = await supabase
    .from('canchas')
    .insert([{
      ...data,
      liga_id,
    }])
    .select()
    .single();
    
  if (error) throw error;
  return cancha;
}

export async function updateCancha(id: string, data: Partial<Cancha>): Promise<Cancha> {
  const { data: cancha, error } = await supabase
    .from('canchas')
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return cancha;
}

export async function deleteCancha(id: string): Promise<void> {
  const { error } = await supabase
    .from('canchas')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// ========================================
// CONFIGURACIÓN DE TEMPORADA
// ========================================

export async function getConfiguracionTemporada(liga_id: string): Promise<ConfiguracionTemporada | null> {
  const { data, error } = await supabase
    .from('configuraciones_temporada')
    .select('*')
    .eq('liga_id', liga_id)
    .eq('activa', true)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createConfiguracionTemporada(data: CreateConfiguracionTemporadaData, liga_id: string): Promise<ConfiguracionTemporada> {
  const { data: config, error } = await supabase
    .from('configuraciones_temporada')
    .insert([{
      ...data,
      liga_id,
    }])
    .select()
    .single();
    
  if (error) throw error;
  return config;
}

export async function updateConfiguracionTemporada(id: string, data: Partial<ConfiguracionTemporada>): Promise<ConfiguracionTemporada> {
  const { data: config, error } = await supabase
    .from('configuraciones_temporada')
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return config;
}

// ========================================
// USER PROFILES
// ========================================

export async function getUserProfile(user_id: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user_id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateUserProfile(user_id: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .update(data)
    .eq('user_id', user_id)
    .select()
    .single();
    
  if (error) throw error;
  return profile;
}

export async function createUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .insert([data])
    .select()
    .single();
    
  if (error) throw error;
  return profile;
}

// ========================================
// ESTADÍSTICAS
// ========================================

export async function getEstadisticasLiga(liga_id: string): Promise<EstadisticasLiga> {
  // Primero obtener los equipos de la liga
  const { data: equipos } = await supabase.from('equipos').select('id').eq('liga_id', liga_id);
  const equipoIds = equipos?.map(e => e.id) || [];
  
  // Luego obtener los jugadores de esos equipos
  const { data: jugadores } = await supabase.from('jugadores').select('id').in('equipo_id', equipoIds);
  
  // Obtener los partidos de la liga
  const { data: partidos } = await supabase.from('partidos').select('*').eq('liga_id', liga_id);

  const partidosJugados = partidos?.filter((p: Partido) => p.estado === 'jugado').length || 0;
  const proximosPartidos = partidos?.filter((p: Partido) => p.estado === 'programado').length || 0;

  return {
    total_equipos: equipos?.length || 0,
    total_jugadores: jugadores?.length || 0,
    total_partidos: partidos?.length || 0,
    partidos_jugados: partidosJugados,
    proximos_partidos: proximosPartidos,
    canchas_disponibles: 0, // TODO: Implementar cuando tengamos canchas
  };
}

export async function getEstadisticasEquipo(equipo_id: string): Promise<EstadisticasEquipo> {
  const { data: jugadores } = await supabase.from('jugadores').select('id').eq('equipo_id', equipo_id);
  const { data: partidos } = await supabase.from('partidos').select('*').or(`equipo_local_id.eq.${equipo_id},equipo_visitante_id.eq.${equipo_id}`);

  const partidosJugados = partidos?.filter((p: Partido) => p.estado === 'jugado') || [];
  let partidosGanados = 0;
  let partidosEmpatados = 0;
  let partidosPerdidos = 0;
  let golesFavor = 0;
  let golesContra = 0;

  partidosJugados.forEach((partido: Partido) => {
    const esLocal = partido.equipo_local_id === equipo_id;
    const golesLocal = partido.marcador_local;
    const golesVisitante = partido.marcador_visitante;

    if (esLocal) {
      golesFavor += golesLocal;
      golesContra += golesVisitante;
      if (golesLocal > golesVisitante) partidosGanados++;
      else if (golesLocal === golesVisitante) partidosEmpatados++;
      else partidosPerdidos++;
    } else {
      golesFavor += golesVisitante;
      golesContra += golesLocal;
      if (golesVisitante > golesLocal) partidosGanados++;
      else if (golesVisitante === golesLocal) partidosEmpatados++;
      else partidosPerdidos++;
    }
  });

  return {
    total_jugadores: jugadores?.length || 0,
    partidos_jugados: partidosJugados.length,
    partidos_ganados: partidosGanados,
    partidos_empatados: partidosEmpatados,
    partidos_perdidos: partidosPerdidos,
    goles_favor: golesFavor,
    goles_contra: golesContra,
    puntos: partidosGanados * 3 + partidosEmpatados,
  };
}
