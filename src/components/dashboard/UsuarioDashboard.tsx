'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Calendar, 
  Eye,
  Trophy,
  User,
  Activity,
  Target
} from 'lucide-react';

interface UsuarioDashboardProps {
  user: any;
  profile: any;
  permisos: any;
}

interface Equipo {
  id: string;
  nombre: string;
  activo: boolean;
  logo_url?: string;
  color_primario: string;
  color_secundario: string;
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

export default function UsuarioDashboard({ profile }: UsuarioDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [liga, setLiga] = useState<Liga | null>(null);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);

  const cargarDatosUsuario = useCallback(async () => {
    try {
      setLoading(true);

      // Si tiene equipo_id, cargar información del equipo
      if (profile?.equipo_id) {
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
          .order('created_at', { ascending: false })
          .limit(10);

        setJugadores(jugadoresData || []);
      }

      // Si tiene liga_id pero no equipo_id, cargar información de la liga
      else if (profile?.liga_id) {
        const { data: ligaData, error: ligaError } = await supabase
          .from('ligas')
          .select('*')
          .eq('id', profile.liga_id)
          .single();

        if (ligaError) throw ligaError;
        setLiga(ligaData);
      }

      // Cargar partidos relacionados
      const filtroPartidos = profile?.equipo_id 
        ? `or(equipo_local_id.eq.${profile.equipo_id},equipo_visitante_id.eq.${profile.equipo_id})`
        : `liga_id.eq.${profile?.liga_id}`;

      const { data: partidosData } = await supabase
        .from('partidos')
        .select('*')
        .or(filtroPartidos)
        .order('created_at', { ascending: false })
        .limit(5);

      setPartidos(partidosData || []);
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.liga_id, profile?.equipo_id]);

  useEffect(() => {
    if (profile?.liga_id || profile?.equipo_id) {
      cargarDatosUsuario();
    }
  }, [profile?.liga_id, profile?.equipo_id, cargarDatosUsuario]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
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
                <User className="w-8 h-8 mr-3 text-blue-600" />
                Mi Panel
              </h1>
              <p className="text-gray-600">
                {equipo ? `Equipo: ${equipo.nombre}` : liga ? `Liga: ${liga.nombre_liga}` : 'Bienvenido a LigaMaster'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-500">
                Usuario
              </Badge>
              {equipo && (
                <Badge className={equipo.activo ? 'bg-green-500' : 'bg-red-500'}>
                  {equipo.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Información Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Información del Equipo */}
          {equipo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Mi Equipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {equipo.logo_url && (
                      <Image 
                        src={equipo.logo_url} 
                        alt={equipo.nombre}
                        className="w-16 h-16 rounded-lg object-cover"
                        width={64}
                        height={64}
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{equipo.nombre}</h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: equipo.color_primario }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: equipo.color_secundario }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Estado:</span>
                      <Badge className={equipo.activo ? 'bg-green-500' : 'bg-red-500'}>
                        {equipo.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Jugadores:</span>
                      <span className="font-medium">{jugadores.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Próximos Partidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Próximos Partidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partidos.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay partidos próximos</p>
                ) : (
                  partidos.map((partido) => (
                    <div key={partido.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {partido.equipo_local_id === equipo?.id ? 'VS Equipo Visitante' : 'VS Equipo Local'}
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

        {/* Acciones Disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {equipo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Mi Equipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href={`/${liga?.slug}/equipos`}>
                    <Button className="w-full justify-start">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles del Equipo
                    </Button>
                  </Link>
                  <Link href={`/${liga?.slug}/calendario`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Ver Calendario de Partidos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Ligas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/buscar">
                  <Button className="w-full justify-start">
                    <Trophy className="w-4 h-4 mr-2" />
                    Buscar Ligas
                  </Button>
                </Link>
                <Link href="/mis-ligas">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Mis Ligas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Mi Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/perfil">
                  <Button className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Ver Mi Perfil
                  </Button>
                </Link>
                <Link href="/configuracion">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="w-4 h-4 mr-2" />
                    Configuración
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jugadores del Equipo */}
        {equipo && jugadores.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Compañeros de Equipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jugadores.map((jugador) => (
                  <div key={jugador.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
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
                    <div className="ml-auto">
                      <Badge className={jugador.activo ? 'bg-green-500' : 'bg-red-500'}>
                        {jugador.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
