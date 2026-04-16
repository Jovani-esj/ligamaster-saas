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

// Interfaz local para usuarios_simple (tabla principal de usuarios)
export interface UsuarioSimple {
  id: string;
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  rol: 'superadmin' | 'adminadmin' | 'admin_liga' | 'capitan_equipo' | 'usuario';
  activo: boolean;
  liga_id?: string;
  equipo_id?: string;
  es_capitan_equipo: boolean;
  telefono?: string;
  fecha_nacimiento?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  equipo?: {
    id: string;
    nombre: string;
    logo_url?: string;
    activo: boolean;
  };
}

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
// SOLICITUDES DE EQUIPOS
// ========================================

import { 
  SolicitudEquipo, 
  SolicitudEquipoConDetalles,
  CreateSolicitudEquipoData,
  LigaDisponible
} from '@/types/database';

export async function getSolicitudesPorLiga(liga_id: string): Promise<SolicitudEquipoConDetalles[]> {
  // Paso 1: Obtener solicitudes
  const { data: solicitudes, error: errorSolicitudes } = await supabase
    .from('solicitudes_equipos')
    .select('*')
    .eq('liga_id', liga_id)
    .order('created_at', { ascending: false });
    
  if (errorSolicitudes) throw errorSolicitudes;
  if (!solicitudes || solicitudes.length === 0) return [];

  // Paso 2: Obtener datos de capitanes
  const capitanIds = solicitudes.map(s => s.capitan_id).filter(Boolean);
  const { data: capitanes, error: errorCapitanes } = await supabase
    .from('usuarios_simple')
    .select('id, nombre, apellido, rol')
    .in('id', capitanIds);

  if (errorCapitanes) console.error('Error obteniendo capitanes:', errorCapitanes);

  // Paso 3: Combinar datos
  const capitanesMap = new Map(capitanes?.map(c => [c.id, c]) || []);
  
  return solicitudes.map(solicitud => ({
    ...solicitud,
    capitan: capitanesMap.get(solicitud.capitan_id) || undefined,
  }));
}

export async function getSolicitudesPorCapitan(capitan_id: string): Promise<SolicitudEquipoConDetalles[]> {
  const { data, error } = await supabase
    .from('solicitudes_equipos')
    .select('*')
    .eq('capitan_id', capitan_id)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

export async function createSolicitudEquipo(
  data: CreateSolicitudEquipoData, 
  capitan_id: string
): Promise<SolicitudEquipo> {
  const { data: solicitud, error } = await supabase
    .from('solicitudes_equipos')
    .insert([{
      ...data,
      capitan_id,
      estado: 'pendiente',
    }])
    .select()
    .single();
    
  if (error) throw error;
  return solicitud;
}

export async function aprobarSolicitudEquipo(
  solicitud_id: string, 
  liga_id: string, 
  respuesta?: string
): Promise<{ solicitud: SolicitudEquipo; equipo: Equipo }> {
  // Primero obtener la solicitud
  const { data: solicitud, error: errorSolicitud } = await supabase
    .from('solicitudes_equipos')
    .select('*')
    .eq('id', solicitud_id)
    .single();
    
  if (errorSolicitud) throw errorSolicitud;
  
  // Crear el equipo
  const { data: equipo, error: errorEquipo } = await supabase
    .from('equipos')
    .insert([{
      liga_id,
      nombre: solicitud.nombre_equipo,
      logo_url: solicitud.logo_url,
      color_primario: '#000000',
      color_secundario: '#FFFFFF',
      capitan_id: solicitud.capitan_id,
      activo: true,
    }])
    .select()
    .single();
    
  if (errorEquipo) throw errorEquipo;
  
  // Actualizar la solicitud
  const { data: solicitudActualizada, error: errorUpdate } = await supabase
    .from('solicitudes_equipos')
    .update({
      estado: 'aprobada',
      equipo_id: equipo.id,
      respuesta_admin: respuesta,
    })
    .eq('id', solicitud_id)
    .select()
    .single();
    
  if (errorUpdate) throw errorUpdate;
  
  // Actualizar el usuario capitán en usuarios_simple
  await supabase
    .from('usuarios_simple')
    .update({
      equipo_id: equipo.id,
      liga_id: liga_id,
      es_capitan_equipo: true,
      rol: 'capitan_equipo',
    })
    .eq('id', solicitud.capitan_id);
  
  return { solicitud: solicitudActualizada, equipo };
}

export async function rechazarSolicitudEquipo(
  solicitud_id: string, 
  respuesta: string
): Promise<SolicitudEquipo> {
  const { data, error } = await supabase
    .from('solicitudes_equipos')
    .update({
      estado: 'rechazada',
      respuesta_admin: respuesta,
    })
    .eq('id', solicitud_id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function getLigasDisponibles(): Promise<LigaDisponible[]> {
  const { data, error } = await supabase
    .from('ligas')
    .select('id, nombre_liga, slug, descripcion, plan')
    .eq('activa', true)
    .order('nombre_liga');
    
  if (error) throw error;
  return (data as LigaDisponible[]) || [];
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

// ========================================
// INVITACIONES A CAPITANES (ADMIN INVITA)
// ========================================

import {
  InvitacionCapitan,
  InvitacionCapitanConDetalles,
  CreateInvitacionCapitanData,
} from '@/types/database';

// Generar token único para invitación
function generarTokenInvitacion(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Crear invitación a capitan (admin envía invitación)
export async function crearInvitacionCapitan(
  data: CreateInvitacionCapitanData
): Promise<InvitacionCapitan> {
  const token = generarTokenInvitacion();
  const fechaExpiracion = new Date();
  fechaExpiracion.setDate(fechaExpiracion.getDate() + 7); // Expira en 7 días

  const { data: invitacion, error } = await supabase
    .from('invitaciones_capitanes')
    .insert([{
      ...data,
      token,
      estado: 'pendiente',
      fecha_expiracion: fechaExpiracion.toISOString(),
    }])
    .select()
    .single();

  if (error) {
    if (error.message.includes('unique constraint')) {
      throw new Error('Ya existe una invitación pendiente para este email en esta liga');
    }
    throw error;
  }

  return invitacion;
}

// Obtener invitaciones por liga (para admin)
export async function getInvitacionesPorLiga(liga_id: string): Promise<InvitacionCapitanConDetalles[]> {
  const { data, error } = await supabase
    .from('invitaciones_capitanes')
    .select(`
      *,
      liga:liga_id (id, nombre_liga, slug),
      capitan:capitan_id (id, nombre, apellido, email)
    `)
    .eq('liga_id', liga_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Obtener invitaciones por email (para capitan ver sus invitaciones)
export async function getInvitacionesPorEmail(email: string): Promise<InvitacionCapitanConDetalles[]> {
  const { data, error } = await supabase
    .from('invitaciones_capitanes')
    .select(`
      *,
      liga:liga_id (id, nombre_liga, slug, logo_url),
      equipo:equipo_id (id, nombre, logo_url)
    `)
    .eq('email', email.toLowerCase())
    .in('estado', ['pendiente', 'aceptada'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Aceptar invitación (capitan acepta unirse)
export async function aceptarInvitacionCapitan(
  invitacion_id: string,
  token: string,
  capitan_id: string,
  nombreEquipo?: string
): Promise<{ invitacion: InvitacionCapitan; equipo: Equipo }> {
  // Verificar invitación
  const { data: invitacion, error: errorInv } = await supabase
    .from('invitaciones_capitanes')
    .select('*')
    .eq('id', invitacion_id)
    .eq('token', token)
    .eq('estado', 'pendiente')
    .single();

  if (errorInv || !invitacion) {
    throw new Error('Invitación no válida o ya procesada');
  }

  // Verificar expiración
  if (invitacion.fecha_expiracion && new Date(invitacion.fecha_expiracion) < new Date()) {
    await supabase
      .from('invitaciones_capitanes')
      .update({ estado: 'expirada' })
      .eq('id', invitacion_id);
    throw new Error('La invitación ha expirado');
  }

  // Crear equipo
  const { data: equipo, error: errorEquipo } = await supabase
    .from('equipos')
    .insert([{
      liga_id: invitacion.liga_id,
      nombre: nombreEquipo || invitacion.nombre_equipo || `Equipo de ${invitacion.nombre || 'Capitán'}`,
      logo_url: invitacion.equipo_id ? undefined : undefined,
      color_primario: '#000000',
      color_secundario: '#FFFFFF',
      capitan_id: capitan_id,
      activo: true,
    }])
    .select()
    .single();

  if (errorEquipo) throw errorEquipo;

  // Actualizar invitación
  const { data: invitacionActualizada, error: errorUpdate } = await supabase
    .from('invitaciones_capitanes')
    .update({
      estado: 'aceptada',
      capitan_id: capitan_id,
      equipo_id: equipo.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitacion_id)
    .select()
    .single();

  if (errorUpdate) throw errorUpdate;

  // Actualizar usuario capitan en usuarios_simple
  await supabase
    .from('usuarios_simple')
    .update({
      equipo_id: equipo.id,
      liga_id: invitacion.liga_id,
      es_capitan_equipo: true,
      rol: 'capitan_equipo',
    })
    .eq('id', capitan_id);

  return { invitacion: invitacionActualizada, equipo };
}

// Rechazar invitación
export async function rechazarInvitacionCapitan(
  invitacion_id: string,
  respuesta: string
): Promise<InvitacionCapitan> {
  const { data, error } = await supabase
    .from('invitaciones_capitanes')
    .update({
      estado: 'rechazada',
      respuesta,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitacion_id)
    .eq('estado', 'pendiente')
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Cancelar invitación (admin cancela)
export async function cancelarInvitacionCapitan(invitacion_id: string): Promise<void> {
  const { error } = await supabase
    .from('invitaciones_capitanes')
    .delete()
    .eq('id', invitacion_id)
    .eq('estado', 'pendiente');

  if (error) throw error;
}

// ========================================
// GESTIÓN DE CAPITANES (PARA ADMIN)
// ========================================

// Obtener capitanes de una liga (solo usuarios_simple)
export async function getCapitanesPorLiga(liga_id: string): Promise<Array<{id: string, nombre: string, apellido: string | null, email: string, telefono: string | null, equipo: {id: string, nombre: string, logo_url: string | null, activo: boolean} | null}>> {
  console.log('Consultando capitanes para liga_id:', liga_id);
  
  // Primero verificar si hay usuarios con es_capitan_equipo en esta liga
  const { data: rawData, error: rawError } = await supabase
    .from('usuarios_simple')
    .select('id, nombre, apellido, email, telefono, liga_id, equipo_id, es_capitan_equipo, rol')
    .eq('liga_id', liga_id)
    .eq('es_capitan_equipo', true);

  if (rawError) {
    console.error('Error en consulta simple de capitanes:', rawError);
    console.error('Código:', rawError.code);
    console.error('Mensaje:', rawError.message);
    console.error('Detalles:', rawError.details);
    throw new Error(`DB Error: ${rawError.message} (${rawError.code})`);
  }

  console.log('Capitanes encontrados (datos crudos):', rawData);
  
  if (!rawData || rawData.length === 0) {
    return [];
  }

  // Si hay datos, obtener los equipos relacionados por separado
  const equipoIds = rawData.filter(u => u.equipo_id).map(u => u.equipo_id);
  
  let equiposMap = new Map();
  if (equipoIds.length > 0) {
    const { data: equipos, error: equiposError } = await supabase
      .from('equipos')
      .select('id, nombre, logo_url, activo')
      .in('id', equipoIds);
    
    if (equiposError) {
      console.error('Error obteniendo equipos:', equiposError);
    } else {
      equiposMap = new Map(equipos?.map(e => [e.id, e]) || []);
    }
  }

  // Combinar datos y mapear al tipo correcto
  const capitanesConEquipo: Array<{id: string, nombre: string, apellido: string | null, email: string, telefono: string | null, equipo: {id: string, nombre: string, logo_url: string | null, activo: boolean} | null}> = rawData.map(capitan => {
    const equipoFromMap = capitan.equipo_id ? equiposMap.get(capitan.equipo_id) : null;
    const equipoFinal: {id: string, nombre: string, logo_url: string | null, activo: boolean} | null = equipoFromMap ?? null;
    return {
      id: capitan.id,
      nombre: capitan.nombre,
      apellido: capitan.apellido || null,
      email: capitan.email,
      telefono: capitan.telefono || null,
      equipo: equipoFinal
    };
  });

  console.log('Capitanes con equipo:', capitanesConEquipo);
  return capitanesConEquipo;
}

// Crear usuario capitan directamente (admin crea cuenta)
export async function crearCapitanDirecto(
  liga_id: string,
  datos: {
    email: string;
    nombre: string;
    apellido?: string;
    telefono?: string;
    nombre_equipo: string;
  }
): Promise<{ user: UsuarioSimple; equipo: Equipo }> {
  const password = generarPasswordTemporal();
  
  // Paso 1: Crear usuario en usuarios_simple
  const { data: usuario, error: errorUsuario } = await supabase
    .from('usuarios_simple')
    .insert([{
      email: datos.email.toLowerCase(),
      password: password,
      nombre: datos.nombre,
      apellido: datos.apellido || '',
      telefono: datos.telefono || null,
      rol: 'capitan_equipo',
      activo: true,
      es_capitan_equipo: false, // Se actualizará después de crear el equipo
    }])
    .select()
    .single();

  if (errorUsuario) {
    if (errorUsuario.message.includes('unique constraint')) {
      throw new Error('Este email ya está registrado');
    }
    throw errorUsuario;
  }

  // Paso 2: Crear equipo
  const { data: equipo, error: errorEquipo } = await supabase
    .from('equipos')
    .insert([{
      liga_id: liga_id,
      nombre: datos.nombre_equipo,
      color_primario: '#000000',
      color_secundario: '#FFFFFF',
      capitan_id: usuario.id,
      activo: true,
    }])
    .select()
    .single();

  if (errorEquipo) throw errorEquipo;

  // Paso 3: Actualizar usuario con equipo y capitanía
  const { data: usuarioActualizado, error: errorUpdate } = await supabase
    .from('usuarios_simple')
    .update({
      liga_id: liga_id,
      equipo_id: equipo.id,
      es_capitan_equipo: true,
    })
    .eq('id', usuario.id)
    .select()
    .single();

  if (errorUpdate) throw errorUpdate;

  // TODO: Enviar email con contraseña temporal
  console.log('Password temporal generado:', password);

  return { user: usuarioActualizado, equipo };
}

// Generar password temporal
function generarPasswordTemporal(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Revocar capitanía (convertir a usuario normal o eliminar del equipo)
export async function revocarCapitan(
  capitan_id: string,
  mantenerEquipo: boolean = false
): Promise<void> {
  if (mantenerEquipo) {
    // Solo quitar capitanía, mantener en equipo
    await supabase
      .from('usuarios_simple')
      .update({
        es_capitan_equipo: false,
        rol: 'usuario',
      })
      .eq('id', capitan_id);
  } else {
    // Quitar de equipo y capitanía
    await supabase
      .from('usuarios_simple')
      .update({
        equipo_id: null,
        liga_id: null,
        es_capitan_equipo: false,
        rol: 'usuario',
      })
      .eq('id', capitan_id);
  }
}

// Asignar capitán existente a una liga (admin lo "reclama")
export async function asignarCapitanALiga(
  capitan_id: string,
  liga_id: string
): Promise<UsuarioSimple> {
  const { data, error } = await supabase
    .from('usuarios_simple')
    .update({
      liga_id: liga_id,
      rol: 'capitan_equipo',
      es_capitan_equipo: true,
    })
    .eq('id', capitan_id)
    .select()
    .single();

  if (error) {
    console.error('Error asignando capitán a liga:', error);
    throw error;
  }

  return data;
}

// Buscar capitanes sin liga asignada (para admin reclamar)
export async function getCapitanesSinLiga(): Promise<Array<{id: string, nombre: string, apellido: string | null, email: string, rol: string, es_capitan_equipo: boolean, created_at: string}>> {
  const { data, error } = await supabase
    .from('usuarios_simple')
    .select('id, nombre, apellido, email, rol, es_capitan_equipo, created_at')
    .is('liga_id', null)
    .eq('rol', 'capitan_equipo');

  if (error) {
    console.error('Error obteniendo capitanes sin liga:', error);
    throw error;
  }

  return (data || []) as Array<{id: string, nombre: string, apellido: string | null, email: string, rol: string, es_capitan_equipo: boolean, created_at: string}>;
}
