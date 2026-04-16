import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Calendar, 
  Plus,
  Eye,
  Edit,
  Trophy,
  Shield,
  MapPin,
  Clock
} from 'lucide-react';
import { EstadisticasLiga, Liga, Equipo, Partido, PermisosRol } from '@/types/database';
import { SimpleProfile } from '@/components/auth/SimpleAuthenticationSystem';

interface AdminLigaDashboardProps {
  profile: SimpleProfile | null;
  permisos: PermisosRol | null;
}

export default function AdminLigaDashboard({ profile, permisos }: AdminLigaDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticasLiga | null>(null);
  const [liga, setLiga] = useState<Liga | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [proximosPartidos, setProximosPartidos] = useState<Partido[]>([]);

  useEffect(() => {
    if (profile?.liga_id) {
      cargarDatosLiga();
    }
  }, [profile?.liga_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarDatosLiga = async () => {
    if (!profile?.liga_id) return;

    try {
      setLoading(true);

      // Cargar información de la liga
      const { data: ligaData, error: ligaError } = await supabase
        .from('ligas')
        .select('*')
        .eq('id', profile.liga_id)
        .single();

      if (ligaError) throw ligaError;
      setLiga(ligaData);

      // Cargar estadísticas de la liga
      const { data: statsData } = await supabase
        .from('vista_estadisticas_liga')
        .select('*')
        .eq('liga_id', profile.liga_id)
        .single();

      // Cargar equipos
      const { data: equiposData } = await supabase
        .from('equipos')
        .select('*')
        .eq('liga_id', profile.liga_id)
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(5);

      // Cargar partidos
      const { data: proximosData } = await supabase
        .from('partidos')
        .select('*')
        .eq('liga_id', profile.liga_id)
        .eq('estado', 'programado')
        .order('fecha_jornada', { ascending: true })
        .limit(3);

      setEstadisticas(statsData || {
        total_equipos: 0,
        total_jugadores: 0,
        total_partidos: 0,
        partidos_jugados: 0,
        proximos_partidos: 0,
        canchas_disponibles: 0
      });

      setEquipos(equiposData || []);
      setProximosPartidos(proximosData || []);
    } catch (error) {
      console.error('Error cargando datos de liga:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard de Administrador...</p>
        </div>
      </div>
    );
  }

  if (!liga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sin Liga Asignada</h1>
          <p className="text-gray-600">
            No tienes una liga asignada. Contacta al administrador del sistema.
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
                <Shield className="w-8 h-8 mr-3 text-blue-600" />
                Panel de Administrador de Liga
              </h1>
              <p className="text-gray-600">
                Gestión de liga: <span className="font-semibold">{liga.nombre_liga}</span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={liga.estatus_pago ? 'bg-green-500' : 'bg-red-500'}>
                {liga.estatus_pago ? 'Pagada' : 'No Pagada'}
              </Badge>
              <Badge className={liga.activa ? 'bg-blue-500' : 'bg-gray-500'}>
                {liga.activa ? 'Activa' : 'Inactiva'}
              </Badge>
              <Badge className="bg-purple-500">
                {liga.plan}
              </Badge>
            </div>
          </div>
        </div>

        {/* Estadísticas de la Liga */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Equipos</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.total_equipos}</p>
                    <p className="text-xs text-gray-500">
                      {estadisticas.total_jugadores} jugadores
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
                    <p className="text-sm font-medium text-gray-600">Partidos Totales</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.total_partidos}</p>
                    <p className="text-xs text-green-600">
                      {estadisticas.partidos_jugados} jugados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Próximos Partidos</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.proximos_partidos}</p>
                    <p className="text-xs text-gray-500">
                      Programados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Canchas</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.canchas_disponibles}</p>
                    <p className="text-xs text-gray-500">
                      Disponibles
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Gestión de Equipos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href={`/${liga.slug}/equipos`}>
                  <Button className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Equipos
                  </Button>
                </Link>
                {permisos?.puede_crear_equipos && (
                  <Link href={`/${liga.slug}/equipos`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Equipo
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
                <Link href={`/${liga.slug}/calendario`}>
                  <Button className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Calendario
                  </Button>
                </Link>
                {permisos?.puede_crear_partidos && (
                  <Link href={`/${liga.slug}/calendario`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Programar Partido
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Gestión de Canchas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href={`/${liga.slug}/canchas`}>
                  <Button className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Ver Canchas
                  </Button>
                </Link>
                {permisos?.puede_crear_canchas && (
                  <Link href={`/${liga.slug}/canchas`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Cancha
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información Reciente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equipos Recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Equipos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipos.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay equipos registrados</p>
                ) : (
                  equipos.map((equipo) => (
                    <div key={equipo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {equipo.logo_url && (
                          <Image 
                            src={equipo.logo_url} 
                            alt={equipo.nombre}
                            className="w-8 h-8 rounded-lg mr-3 object-cover"
                            width={32}
                            height={32}
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{equipo.nombre}</p>
                          <Badge className={equipo.activo ? 'bg-green-500' : 'bg-red-500'}>
                            {equipo.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </div>
                      <Link href={`/${liga.slug}/equipos`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
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
                          Partido #{partido.id}
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
