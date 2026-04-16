'use client';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { PERMISOS_POR_ROL, RolUsuario, UserProfile } from '@/types/database';
import { Shield } from 'lucide-react';

// Componentes específicos para cada rol
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminAdminDashboard from './AdminAdminDashboard';
import AdminLigaDashboard from './AdminLigaDashboard';
import CapitanDashboard from './CapitanDashboard';
import UsuarioDashboard from './UsuarioDashboard';

export default function DynamicDashboard() {
  const { user, profile } = useSimpleAuth();
  
  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const permisos = PERMISOS_POR_ROL[profile.rol as keyof typeof PERMISOS_POR_ROL];

  // Renderizar dashboard según el rol
  switch (profile.rol as RolUsuario) {
    case 'superadmin':
      return <SuperAdminDashboard user={user} profile={profile as UserProfile} permisos={permisos} />;
    case 'adminadmin':
      return <AdminAdminDashboard profile={profile as UserProfile} permisos={permisos} />;
    case 'admin_liga':
      return <AdminLigaDashboard profile={profile as UserProfile} permisos={permisos} />;
    case 'capitan_equipo':
      return <CapitanDashboard user={user} profile={profile} permisos={permisos} />;
    case 'usuario':
      return <UsuarioDashboard user={user} profile={profile} permisos={permisos} />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Rol No Reconocido</h1>
            <p className="text-gray-600">
              Tu rol ({profile.rol}) no está configurado en el sistema.
            </p>
          </div>
        </div>
      );
  }
}
