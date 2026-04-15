'use client';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import EquipoManager from '@/components/admin/EquipoManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Trophy, MapPin } from 'lucide-react';

function EquiposContent() {
  const { profile } = useSimpleAuth();

  if (!profile?.liga_id) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-600">No tienes una liga asignada</h3>
        <p className="text-gray-500 mt-2">Contacta al administrador para asignarte a una liga</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="equipos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="equipos" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Equipos</span>
            </TabsTrigger>
            <TabsTrigger value="jugadores" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Jugadores</span>
            </TabsTrigger>
            <TabsTrigger value="canchas" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Canchas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipos" className="space-y-6">
            <EquipoManager />
          </TabsContent>

          <TabsContent value="jugadores" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Gestión de Jugadores</h3>
              <p className="text-gray-600">
                Panel de gestión de jugadores - En desarrollo
              </p>
            </div>
          </TabsContent>

          <TabsContent value="canchas" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Gestión de Canchas</h3>
              <p className="text-gray-600">
                Panel de gestión de canchas - En desarrollo
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function EquiposPage() {
  const { profile } = useSimpleAuth();
  
  // Check if user has admin privileges
  const isAdmin = profile?.rol === 'admin_liga' || 
                  profile?.rol === 'adminadmin' || 
                  profile?.rol === 'superadmin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600">
              No tienes permisos de administrador para acceder a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <EquiposContent />;
}
