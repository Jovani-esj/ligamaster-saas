import { UserProfile, PermisosRol, EstadisticasLiga, Liga, Equipo, Partido } from './database';

export interface DashboardProps {
  user: {
    id: string;
    email: string;
  } | null;
  profile: UserProfile | null;
  permisos: PermisosRol | null;
}

export interface EstadisticasGlobales {
  totalUsuarios: number;
  totalLigas: number;
  totalEquipos: number;
  totalPartidos: number;
  usuariosActivos: number;
  ligasActivas: number;
}

export interface ActividadReciente {
  id: string;
  tipo: 'usuario' | 'liga' | 'equipo' | 'partido';
  descripcion: string;
  timestamp: string;
  usuario?: string;
}

export type { EstadisticasLiga, Liga, Equipo, Partido };
