import { UserProfile, PermisosRol, EstadisticasLiga, Liga, Equipo, Partido } from './database';

export interface DashboardProps {
  user: {
    id: string;
    email: string;
  } | null;
  profile: UserProfile | null;
  permisos: PermisosRol | null;
}

export type { EstadisticasLiga, Liga, Equipo, Partido };
