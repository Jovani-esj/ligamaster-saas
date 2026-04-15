'use client';
import { useAuth } from '@/components/auth/AuthenticationSystem';
import { ProtectedRoute } from '@/components/auth/AuthenticationSystem';
import EquipoManager from '@/components/admin/EquipoManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Trophy, MapPin } from 'lucide-react';

function EquiposContent() {
  const { profile } = useAuth();

  if (!profile?.liga_id) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-600">No tienes una liga asignada</h3>
        <p className="text-gray-500 mt-2">Contacta al administrador para asignarte a una liga</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gestión de Equipos</h1>
          <p className="text-gray-600 mt-2">
            Administra los equipos de tu liga
          </p>
        </div>

        <Tabs defaultValue="equipos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="equipos" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Equipos</span>
            </TabsTrigger>
            <TabsTrigger value="jugadores" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Jugadores</span>
            </TabsTrigger>
            <TabsTrigger value="torneos" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Torneos</span>
            </TabsTrigger>
            <TabsTrigger value="canchas" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Canchas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipos" className="space-y-6">
            <EquipoManager ligaId={profile.liga_id} />
          </TabsContent>

          <TabsContent value="jugadores" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Gestión de Jugadores</h3>
              <p className="text-gray-600">
                Selecciona un equipo para administrar sus jugadores
              </p>
            </div>
          </TabsContent>

          <TabsContent value="torneos" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Gestión de Torneos</h3>
              <p className="text-gray-600">
                Administra los torneos de la liga
              </p>
            </div>
          </TabsContent>

          <TabsContent value="canchas" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Gestión de Canchas</h3>
              <p className="text-gray-600">
                Administra las canchas disponibles para los partidos
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function EquiposPage() {
  return (
    <ProtectedRoute>
      <EquiposContent />
    </ProtectedRoute>
  );
}
