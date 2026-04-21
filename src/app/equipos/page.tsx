'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import EquipoManager from '@/components/admin/EquipoManager';
import JugadorManager from '@/components/admin/JugadorManager';
import CanchaManager from '@/components/admin/CanchaManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, LogOut, ArrowRight, Home, Users, Trophy, MapPin, Shield, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getEquipos } from '@/lib/database';
import { Equipo } from '@/types/database';
import Link from 'next/link';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
}

function EquiposContent() {
  const { user, profile } = useSimpleAuth();
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [selectedLigaId, setSelectedLigaId] = useState<string>('');
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [selectedEquipoId, setSelectedEquipoId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const isAdminAdmin = profile?.rol === 'adminadmin' || profile?.rol === 'superadmin';

  const cargarLigas = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('ligas')
        .select('id, nombre_liga, slug')
        .eq('owner_id', user.id)
        .eq('activa', true);

      if (error) throw error;
      setLigas(data || []);
      
      // Si solo tiene una liga, seleccionarla automáticamente
      if (data && data.length === 1) {
        setSelectedLigaId(data[0].id);
      }
    } catch (error) {
      console.error('Error cargando ligas:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    cargarLigas();
  }, [cargarLigas]);

  useEffect(() => {
    if (selectedLigaId) {
      getEquipos(selectedLigaId)
        .then(data => {
          setEquipos(data);
          if (data.length > 0 && !selectedEquipoId) {
            setSelectedEquipoId(data[0].id);
          } else if (data.length === 0) {
            setSelectedEquipoId('');
          }
        })
        .catch(console.error);
    } else {
      setEquipos([]);
      setSelectedEquipoId('');
    }
  }, [selectedLigaId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no tiene ligas, mostrar mensaje para crear una
  if (ligas.length === 0 && !isAdminAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes ligas creadas
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Como administrador de liga, debes crear una liga primero para poder gestionar equipos.
              </p>
              <Link href="/mis-ligas">
                <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                  <Plus className="w-5 h-5 mr-2" />
                  Ir a Mis Ligas
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Si tiene múltiples ligas y no ha seleccionado una, mostrar selector
  if (ligas.length > 1 && !selectedLigaId && !isAdminAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="py-12">
            <CardContent className="text-center">
              <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Selecciona una Liga
              </h3>
              <p className="text-gray-600 mb-6">
                Tienes {ligas.length} ligas. Selecciona una para gestionar sus equipos:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {ligas.map((liga) => (
                  <button
                    key={liga.id}
                    onClick={() => setSelectedLigaId(liga.id)}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <Shield className="w-8 h-8 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-lg">{liga.nombre_liga}</h4>
                    <p className="text-sm text-gray-500">/{liga.slug}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con selector de liga si tiene múltiples */}
        {ligas.length > 1 && (
          <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Liga seleccionada:</p>
                <p className="font-semibold">
                  {ligas.find(l => l.id === selectedLigaId)?.nombre_liga || 'Selecciona una liga'}
                </p>
              </div>
            </div>
            <select
              value={selectedLigaId}
              onChange={(e) => setSelectedLigaId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {ligas.map((liga) => (
                <option key={liga.id} value={liga.id}>
                  {liga.nombre_liga}
                </option>
              ))}
            </select>
          </div>
        )}

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
            <EquipoManager ligaId={selectedLigaId} />
          </TabsContent>

          <TabsContent value="jugadores" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center gap-4">
                <Users className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecciona un Equipo
                  </label>
                  <select
                    value={selectedEquipoId}
                    onChange={(e) => setSelectedEquipoId(e.target.value)}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un equipo</option>
                    {equipos.map((equipo) => (
                      <option key={equipo.id} value={equipo.id}>
                        {equipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {selectedEquipoId ? (
              <JugadorManager 
                equipoId={selectedEquipoId} 
                equipoNombre={equipos.find(e => e.id === selectedEquipoId)?.nombre} 
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Selecciona un equipo para gestionar sus jugadores.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="canchas" className="space-y-6">
            <CanchaManager 
              ligaId={selectedLigaId} 
              ligaNombre={ligas.find(l => l.id === selectedLigaId)?.nombre_liga} 
            />
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
