'use client';
import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import EquipoManager from '@/components/admin/EquipoManager';
import JugadorManager from '@/components/admin/JugadorManager';
import CanchaManager from '@/components/admin/CanchaManager';
import ArbitroManager from '@/components/admin/ArbitroManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Trophy, MapPin, Shield } from 'lucide-react';
import { getEquipos } from '@/lib/database';
import { Equipo } from '@/types/database';

function EquiposContent() {
  const { profile } = useSimpleAuth();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [selectedEquipoId, setSelectedEquipoId] = useState<string>('');
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    async function loadTeams() {
      if (profile?.liga_id) {
        try {
          setLoadingTeams(true);
          const data = await getEquipos(profile.liga_id);
          setEquipos(data);
          if (data.length > 0) {
            setSelectedEquipoId(data[0].id);
          }
        } catch (error) {
          console.error('Error loading teams for dropdown:', error);
        } finally {
          setLoadingTeams(false);
        }
      }
    }
    loadTeams();
  }, [profile?.liga_id]);

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
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="arbitros" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Árbitros</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipos" className="space-y-6">
            <EquipoManager />
          </TabsContent>

          <TabsContent value="jugadores" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Gestión de Jugadores</h3>
                  <p className="text-sm text-gray-500">Selecciona un equipo para ver y editar su plantilla de jugadores</p>
                </div>
                {equipos.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <label htmlFor="equipo-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Equipo:
                    </label>
                    <select
                      id="equipo-select"
                      value={selectedEquipoId}
                      onChange={(e) => setSelectedEquipoId(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {equipos.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {loadingTeams ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500 text-sm">Cargando equipos...</p>
                </div>
              ) : equipos.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 border rounded-lg">
                  <p className="text-gray-500 text-sm">No hay equipos registrados en esta liga. Primero crea un equipo en la pestaña Equipos.</p>
                </div>
              ) : selectedEquipoId ? (
                <JugadorManager 
                  equipoId={selectedEquipoId} 
                  equipoNombre={equipos.find(e => e.id === selectedEquipoId)?.nombre} 
                />
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="canchas" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <CanchaManager ligaId={profile.liga_id} />
            </div>
          </TabsContent>

          <TabsContent value="arbitros" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <ArbitroManager ligaId={profile.liga_id} />
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
