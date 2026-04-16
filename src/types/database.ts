// Tipos para la base de datos de LigaMaster SaaS

export interface Liga {
  id: string;
  descripcion: string;
  nombre_liga: string;
  slug: string;
  owner_id?: string;
  estatus_pago: boolean;
  plan: 'Bronce' | 'Plata' | 'Oro';
  fecha_registro: string;
  fecha_vencimiento?: string;
  activa: boolean;
}

export interface Equipo {
  id: string;
  liga_id: string;
  nombre: string;
  logo_url?: string;
  color_primario: string;
  color_secundario: string;
  capitan_id?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Torneo {
  id: string;
  liga_id: string;
  nombre: string;
  activo: boolean;
}

export interface Partido {
  id: string;
  liga_id: string;
  torneo_id: string;
  equipo_local_id?: string;
  equipo_visitante_id?: string;
  marcador_local: number;
  marcador_visitante: number;
  fecha_jornada?: string;
  estado: 'programado' | 'jugado' | 'cancelado';
  cancha_id?: string;
  duracion_minutos: number;
  jornada?: number;
  observaciones?: string;
  creado_por?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  rol: 'superadmin' | 'adminadmin' | 'admin_liga' | 'capitan_equipo' | 'usuario';
  liga_id?: string;
  equipo_id?: string;
  es_capitan_equipo: boolean;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Jugador {
  id: string;
  equipo_id: string;
  user_profile_id?: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  numero_camiseta?: number;
  posicion?: string;
  foto_url?: string;
  activo: boolean;
  es_capitan: boolean;
  fecha_registro: string;
  created_at: string;
  updated_at: string;
}

export interface Cancha {
  id: string;
  liga_id: string;
  nombre: string;
  direccion?: string;
  tipo: string;
  superficie: string;
  capacidad_espectadores: number;
  tiene_iluminacion: boolean;
  tiene_vestuarios: boolean;
  precio_hora: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConfiguracionTemporada {
  id: string;
  liga_id: string;
  nombre_temporada: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_juego: string[];
  hora_inicio: string;
  hora_fin: string;
  intervalo_minutos: number;
  formato: string;
  vueltas: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventoPartido {
  id: string;
  partido_id: string;
  jugador_id?: string;
  equipo_id?: string;
  tipo_evento: string;
  minuto?: number;
  descripcion?: string;
  created_at: string;
}

// Tipos para relaciones y datos extendidos
export interface EquipoConJugadores extends Equipo {
  jugadores: Jugador[];
  capitan?: UserProfile;
}

export interface PartidoConEquipos extends Partido {
  equipo_local?: Equipo;
  equipo_visitante?: Equipo;
  cancha?: Cancha;
}

export interface LigaConEquipos extends Liga {
  equipos: Equipo[];
  owner?: UserProfile;
  configuracion_temporada?: ConfiguracionTemporada;
}

export interface UserProfileConDetalles extends UserProfile {
  liga?: Liga;
  equipo?: Equipo;
  user?: {
    email: string;
    created_at: string;
  };
}

// Tipos para formularios y UI
export interface CreateLigaData {
  nombre_liga: string;
  descripcion: string;
  plan: 'Bronce' | 'Plata' | 'Oro';
}

export interface CreateEquipoData {
  nombre: string;
  logo_url?: string;
  color_primario: string;
  color_secundario: string;
}

export interface CreateJugadorData {
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  numero_camiseta?: number;
  posicion?: string;
  foto_url?: string;
  es_capitan?: boolean;
}

export interface CreateTorneoData {
  nombre: string;
}

export interface CreateCanchaData {
  nombre: string;
  direccion?: string;
  tipo: string;
  superficie: string;
  capacidad_espectadores?: number;
  tiene_iluminacion?: boolean;
  tiene_vestuarios?: boolean;
  precio_hora?: number;
}

export interface CreateConfiguracionTemporadaData {
  nombre_temporada: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_juego: string[];
  hora_inicio: string;
  hora_fin: string;
  intervalo_minutos?: number;
  formato?: string;
  vueltas?: number;
}

// Tipos para filtros y búsqueda
export interface FiltroLigas {
  plan?: 'Bronce' | 'Plata' | 'Oro';
  activa?: boolean;
  estatus_pago?: boolean;
  search?: string;
}

export interface FiltroEquipos {
  activo?: boolean;
  search?: string;
}

export interface FiltroJugadores {
  activo?: boolean;
  es_capitan?: boolean;
  posicion?: string;
  search?: string;
}

export interface FiltroPartidos {
  estado?: 'programado' | 'jugado' | 'cancelado';
  torneo_id?: string;
  equipo_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

// Tipos para estadísticas y dashboard
export interface EstadisticasLiga {
  total_equipos: number;
  total_jugadores: number;
  total_partidos: number;
  partidos_jugados: number;
  proximos_partidos: number;
  canchas_disponibles: number;
}

export interface EstadisticasEquipo {
  total_jugadores: number;
  partidos_jugados: number;
  partidos_ganados: number;
  partidos_empatados: number;
  partidos_perdidos: number;
  goles_favor: number;
  goles_contra: number;
  puntos: number;
}

// Tipos para permisos y acceso
export type RolUsuario = 'superadmin' | 'adminadmin' | 'admin_liga' | 'capitan_equipo' | 'usuario';

export interface PermisosRol {
  puede_ver_ligas: boolean;
  puede_crear_ligas: boolean;
  puede_editar_ligas: boolean;
  puede_eliminar_ligas: boolean;
  puede_ver_equipos: boolean;
  puede_crear_equipos: boolean;
  puede_editar_equipos: boolean;
  puede_eliminar_equipos: boolean;
  puede_ver_jugadores: boolean;
  puede_crear_jugadores: boolean;
  puede_editar_jugadores: boolean;
  puede_eliminar_jugadores: boolean;
  puede_ver_torneos: boolean;
  puede_crear_torneos: boolean;
  puede_editar_torneos: boolean;
  puede_eliminar_torneos: boolean;
  puede_ver_partidos: boolean;
  puede_crear_partidos: boolean;
  puede_editar_partidos: boolean;
  puede_eliminar_partidos: boolean;
  puede_ver_canchas: boolean;
  puede_crear_canchas: boolean;
  puede_editar_canchas: boolean;
  puede_eliminar_canchas: boolean;
  puede_ver_configuracion: boolean;
  puede_editar_configuracion: boolean;
}

export const PERMISOS_POR_ROL: Record<RolUsuario, PermisosRol> = {
  superadmin: {
    puede_ver_ligas: true,
    puede_crear_ligas: true,
    puede_editar_ligas: true,
    puede_eliminar_ligas: true,
    puede_ver_equipos: true,
    puede_crear_equipos: true,
    puede_editar_equipos: true,
    puede_eliminar_equipos: true,
    puede_ver_jugadores: true,
    puede_crear_jugadores: true,
    puede_editar_jugadores: true,
    puede_eliminar_jugadores: true,
    puede_ver_torneos: true,
    puede_crear_torneos: true,
    puede_editar_torneos: true,
    puede_eliminar_torneos: true,
    puede_ver_partidos: true,
    puede_crear_partidos: true,
    puede_editar_partidos: true,
    puede_eliminar_partidos: true,
    puede_ver_canchas: true,
    puede_crear_canchas: true,
    puede_editar_canchas: true,
    puede_eliminar_canchas: true,
    puede_ver_configuracion: true,
    puede_editar_configuracion: true,
  },
  adminadmin: {
    puede_ver_ligas: true,
    puede_crear_ligas: true,
    puede_editar_ligas: true,
    puede_eliminar_ligas: true,
    puede_ver_equipos: true,
    puede_crear_equipos: true,
    puede_editar_equipos: true,
    puede_eliminar_equipos: true,
    puede_ver_jugadores: true,
    puede_crear_jugadores: true,
    puede_editar_jugadores: true,
    puede_eliminar_jugadores: true,
    puede_ver_torneos: true,
    puede_crear_torneos: true,
    puede_editar_torneos: true,
    puede_eliminar_torneos: true,
    puede_ver_partidos: true,
    puede_crear_partidos: true,
    puede_editar_partidos: true,
    puede_eliminar_partidos: true,
    puede_ver_canchas: true,
    puede_crear_canchas: true,
    puede_editar_canchas: true,
    puede_eliminar_canchas: true,
    puede_ver_configuracion: true,
    puede_editar_configuracion: true,
  },
  admin_liga: {
    puede_ver_ligas: true,
    puede_crear_ligas: true,
    puede_editar_ligas: true,
    puede_eliminar_ligas: true,
    puede_ver_equipos: true,
    puede_crear_equipos: true,
    puede_editar_equipos: true,
    puede_eliminar_equipos: true,
    puede_ver_jugadores: true,
    puede_crear_jugadores: true,
    puede_editar_jugadores: true,
    puede_eliminar_jugadores: true,
    puede_ver_torneos: true,
    puede_crear_torneos: true,
    puede_editar_torneos: true,
    puede_eliminar_torneos: true,
    puede_ver_partidos: true,
    puede_crear_partidos: true,
    puede_editar_partidos: true,
    puede_eliminar_partidos: true,
    puede_ver_canchas: true,
    puede_crear_canchas: true,
    puede_editar_canchas: true,
    puede_eliminar_canchas: true,
    puede_ver_configuracion: true,
    puede_editar_configuracion: true,
  },
  capitan_equipo: {
    puede_ver_ligas: false,
    puede_crear_ligas: false,
    puede_editar_ligas: false,
    puede_eliminar_ligas: false,
    puede_ver_equipos: true,
    puede_crear_equipos: false,
    puede_editar_equipos: true,
    puede_eliminar_equipos: false,
    puede_ver_jugadores: true,
    puede_crear_jugadores: true,
    puede_editar_jugadores: true,
    puede_eliminar_jugadores: true,
    puede_ver_torneos: true,
    puede_crear_torneos: false,
    puede_editar_torneos: false,
    puede_eliminar_torneos: false,
    puede_ver_partidos: true,
    puede_crear_partidos: false,
    puede_editar_partidos: false,
    puede_eliminar_partidos: false,
    puede_ver_canchas: true,
    puede_crear_canchas: false,
    puede_editar_canchas: false,
    puede_eliminar_canchas: false,
    puede_ver_configuracion: false,
    puede_editar_configuracion: false,
  },
  usuario: {
    puede_ver_ligas: false,
    puede_crear_ligas: false,
    puede_editar_ligas: false,
    puede_eliminar_ligas: false,
    puede_ver_equipos: true,
    puede_crear_equipos: false,
    puede_editar_equipos: false,
    puede_eliminar_equipos: false,
    puede_ver_jugadores: true,
    puede_crear_jugadores: false,
    puede_editar_jugadores: false,
    puede_eliminar_jugadores: false,
    puede_ver_torneos: true,
    puede_crear_torneos: false,
    puede_editar_torneos: false,
    puede_eliminar_torneos: false,
    puede_ver_partidos: true,
    puede_crear_partidos: false,
    puede_editar_partidos: false,
    puede_eliminar_partidos: false,
    puede_ver_canchas: true,
    puede_crear_canchas: false,
    puede_editar_canchas: false,
    puede_eliminar_canchas: false,
    puede_ver_configuracion: false,
    puede_editar_configuracion: false,
  },
};
