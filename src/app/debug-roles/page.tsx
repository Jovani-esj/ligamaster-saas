'use client';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';

export default function DebugRolesPage() {
  const { user, profile } = useSimpleAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Roles</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user?.id || 'No disponible'}</p>
            <p><strong>Email:</strong> {user?.email || 'No disponible'}</p>
            <p><strong>Nombre:</strong> {user?.nombre || 'No disponible'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Información del Perfil</h2>
          <div className="space-y-2">
            <p><strong>Profile ID:</strong> {profile?.id || 'No disponible'}</p>
            <p><strong>User ID:</strong> {profile?.user_id || 'No disponible'}</p>
            <p><strong>Nombre:</strong> {profile?.nombre || 'No disponible'}</p>
            <p><strong>Apellido:</strong> {profile?.apellido || 'No disponible'}</p>
            <p><strong>Rol:</strong> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{profile?.rol || 'No disponible'}</span></p>
            <p><strong>Activo:</strong> {profile?.activo ? 'Sí' : 'No'}</p>
            <p><strong>Liga ID:</strong> {profile?.liga_id || 'No disponible'}</p>
            <p><strong>Equipo ID:</strong> {profile?.equipo_id || 'No disponible'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Verificación de Accesos</h2>
          <div className="space-y-2">
            <p><strong>Es Admin Admin:</strong> {profile?.rol === 'adminadmin' || profile?.rol === 'superadmin' ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Es Admin Liga:</strong> {profile?.rol === 'admin_liga' ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Es Capitán:</strong> {profile?.rol === 'capitan_equipo' ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Es Usuario:</strong> {profile?.rol === 'usuario' ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Es Super Admin:</strong> {profile?.rol === 'superadmin' ? '✅ Sí' : '❌ No'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
