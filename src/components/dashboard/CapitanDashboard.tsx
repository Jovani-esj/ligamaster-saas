'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  Plus,
  Eye,
  Crown,
  Activity,
  Target
} from 'lucide-react';

import { PermisosRol } from '@/types/database';
import { SimpleUser, SimpleProfile } from '@/components/auth/SimpleAuthenticationSystem';

interface CapitanDashboardProps {
  user: SimpleUser | null;
  profile: SimpleProfile | null;
  permisos: PermisosRol | null;
}

interface Equipo {
  id: string;
  nombre: string;
  activo: boolean;
  logo_url?: string;
  color_primario: string;
  color_secundario: string;
}

interface Jugador {
  id: string;
  nombre: string;
  apellido?: string;
  numero_camiseta?: number;
  posicion?: string;
  activo: boolean;
  es_capitan: boolean;
}

interface Partido {
  id: string;
  fecha_jornada?: string;
  estado: string;
  equipo_local_id?: string;
  equipo_visitante_id?: string;
}

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  activa: boolean;
}

export default function CapitanDashboard({ profile, permisos }: CapitanDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [liga, setLiga] = useState<Liga | null>(null);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [proximosPartidos, setProximosPartidos] = useState<Partido[]>([]);

  const cargarDatosEquipo = useCallback(async () => {
    if (!profile?.equipo_id) return;

    try {
      setLoading(true);

      // Cargar información del equipo
      const { data: equipoData, error: equipoError } = await supabase
        .from('equipos')
        .select('*, ligas(*)')
        .eq('id', profile.equipo_id)
        .single();

      if (equipoError) throw equipoError;
      setEquipo(equipoData);
      setLiga(equipoData?.ligas || null);

      // Cargar jugadores del equipo
      const { data: jugadoresData } = await supabase
        .from('jugadores')
        .select('*')
        .eq('equipo_id', profile.equipo_id)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      // Cargar partidos del equipo
      const { data: partidosData } = await supabase
        .from('partidos')
        .select('*')
        .or(`equipo_local_id.eq.${profile.equipo_id},equipo_visitante_id.eq.${profile.equipo_id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      // Cargar próximos partidos del equipo
      const { data: proximosData } = await supabase
        .from('partidos')
        .select('*')
        .or(`equipo_local_id.eq.${profile.equipo_id},equipo_visitante_id.eq.${profile.equipo_id}`)
        .eq('estado', 'programado')
        .order('fecha_jornada', { ascending: true })
        .limit(3);

      setJugadores(jugadoresData || []);
      setPartidos(partidosData || []);
      setProximosPartidos(proximosData || []);
    } catch (error) {
      console.error('Error cargando datos del equipo:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.equipo_id]);

  useEffect(() => {
    if (profile?.equipo_id) {
      cargarDatosEquipo();
    }
  }, [profile?.equipo_id, cargarDatosEquipo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard de Capitán...</p>
        </div>
      </div>
    );
  }

  if (!equipo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sin Equipo Asignado</h1>
          <p className="text-gray-600">
            No tienes un equipo asignado. Contacta al administrador de tu liga.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Crown className="w-8 h-8 mr-3 text-yellow-600" />
                Panel de Capitán
              </h1>
              <p className="text-gray-600">
                Gestión del equipo: <span className="font-semibold">{equipo.nombre}</span>
              </p>
              {liga && (
                <p className="text-sm text-gray-500">
                  Liga: {liga.nombre_liga}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-yellow-500">
                Capitán
              </Badge>
              <Badge className={equipo.activo ? 'bg-green-500' : 'bg-red-500'}>
                {equipo.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Estadísticas del Equipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Jugadores</p>
                  <p className="text-2xl font-bold text-gray-900">{jugadores.length}</p>
                  <p className="text-xs text-gray-500">
                    En el equipo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Partidos Jugados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {partidos.filter(p => p.estado === 'jugado').length}
                  </p>
                  <p className="text-xs text-gray-500">
                    Historial
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Próximos Partidos</p>
                  <p className="text-2xl font-bold text-gray-900">{proximosPartidos.length}</p>
                  <p className="text-xs text-gray-500">
                    Programados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones del Capitán */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Gestión de Jugadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href={`/${liga?.slug}/equipos`}>
                  <Button className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Jugadores
                  </Button>
                </Link>
                {permisos?.puede_crear_jugadores && (
                  <Link href={`/${liga?.slug}/equipos`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Jugador
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Gestión de Partidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href={`/${liga?.slug}/calendario`}>
                  <Button className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Calendario
                  </Button>
                </Link>
                <Link href={`/${liga?.slug}/calendario`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Ver Resultados
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información del Equipo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jugadores del Equipo */}
          <Card>
            <CardHeader>
              <CardTitle>Jugadores del Equipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jugadores.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay jugadores en el equipo</p>
                ) : (
                  jugadores.map((jugador) => (
                    <div key={jugador.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold">#{jugador.numero_camiseta || '?'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {jugador.nombre} {jugador.apellido || ''}
                          </p>
                          <p className="text-sm text-gray-500">
                            {jugador.posicion || 'Sin posición'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={jugador.activo ? 'bg-green-500' : 'bg-red-500'}>
                          {jugador.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {jugador.es_capitan && (
                          <Badge className="bg-yellow-500">
                            Capitán
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Próximos Partidos */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Partidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proximosPartidos.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay partidos programados</p>
                ) : (
                  proximosPartidos.map((partido) => (
                    <div key={partido.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {partido.equipo_local_id === equipo.id ? 'VS ' + 'Equipo Visitante' : 'VS ' + 'Equipo Local'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {partido.fecha_jornada ? new Date(partido.fecha_jornada).toLocaleDateString() : 'Por programar'}
                        </p>
                      </div>
                      <Badge className={partido.estado === 'programado' ? 'bg-blue-500' : 'bg-gray-500'}>
                        {partido.estado}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
