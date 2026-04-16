'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthenticationSystem';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Trophy,
  DollarSign,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface EstadisticasLiga {
  total_equipos: number;
  total_jugadores: number;
  total_canchas: number;
  total_partidos: number;
  partidos_jugados: number;
  partidos_programados: number;
}

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  descripcion?: string;
  estatus_pago: boolean;
  activa: boolean;
  plan: string;
  fecha_registro: string;
  fecha_vencimiento?: string;
}

export default function DashboardLiga() {
  const { user, profile, isAdminLiga, isAdminAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticasLiga | null>(null);
  const [liga, setLiga] = useState<Liga | null>(null);
  const [proximosPartidos, setProximosPartidos] = useState<any[]>([]);

  useEffect(() => {
    if (user && (isAdminLiga || isAdminAdmin)) {
      cargarDatosDashboard();
    }
  }, [user, isAdminLiga, isAdminAdmin]);

  const cargarDatosDashboard = async () => {
    try {
      // Cargar información de la liga
      let ligaQuery = supabase.from('ligas').select('*');
      
      if (!isAdminAdmin && profile?.liga_id) {
        ligaQuery = ligaQuery.eq('id', profile.liga_id);
      }
      
      const { data: ligaData, error: ligaError } = await ligaQuery.single();
      
      if (ligaError && ligaError.code !== 'PGRST116') {
        throw ligaError;
      }
      
      if (ligaData) {
        setLiga(ligaData);
        
        // Cargar estadísticas
        await cargarEstadisticas(ligaData.id);
        
        // Cargar próximos partidos
        await cargarProximosPartidos(ligaData.id);
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async (ligaId: string) => {
    try {
      const { data, error } = await supabase
        .from('vista_estadisticas_liga')
        .select('*')
        .eq('liga_id', ligaId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setEstadisticas({
          total_equipos: data.total_equipos || 0,
          total_jugadores: data.total_jugadores || 0,
          total_canchas: data.total_canchas || 0,
          total_partidos: data.total_partidos || 0,
          partidos_jugados: data.partidos_jugados || 0,
          partidos_programados: (data.total_partidos || 0) - (data.partidos_jugados || 0)
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const cargarProximosPartidos = async (ligaId: string) => {
    try {
      const { data, error } = await supabase
        .from('partidos')
        .select(`
          *,
          equipo_local:equipos!partidos_equipo_local_id_fkey(nombre),
          equipo_visitante:equipos!partidos_equipo_visitante_id_fkey(nombre),
          cancha:canchas(nombre)
        `)
        .eq('liga_id', ligaId)
        .eq('estado', 'programado')
        .gte('fecha_jornada', new Date().toISOString())
        .order('fecha_jornada', { ascending: true })
        .limit(5);

      if (error) throw error;
      setProximosPartidos(data || []);
    } catch (error) {
      console.error('Error cargando próximos partidos:', error);
    }
  };

  const cambiarEstadoPago = async (nuevoEstado: boolean) => {
    if (!liga) return;
    
    const confirmacion = nuevoEstado 
      ? '¿Estás seguro de marcar esta liga como pagada?'
      : '¿Estás seguro de marcar esta liga como no pagada? Esto suspenderá la liga.';
    
    if (!confirm(confirmacion)) return;

    try {
      const { error } = await supabase
        .from('ligas')
        .update({ 
          estatus_pago: nuevoEstado,
          activa: nuevoEstado
        })
        .eq('id', liga.id);

      if (error) throw error;

      toast.success(nuevoEstado ? 'Liga marcada como pagada' : 'Liga marcada como no pagada');
      await cargarDatosDashboard();
    } catch (error) {
      console.error('Error cambiando estado de pago:', error);
      toast.error('Error al cambiar el estado de pago');
    }
  };

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

  if (!isAdminLiga && !isAdminAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600">
              No tienes permisos para acceder al dashboard de administración.
            </p>
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard de {liga?.nombre_liga || 'Liga'}
              </h1>
              <p className="text-gray-600">
                Gestión completa de tu liga
              </p>
            </div>
            {liga && (
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                 liga.estatus_pago 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {liga.estatus_pago ? 'Pagada' : 'No Pagada'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                 liga.activa 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {liga.activa ? 'Activa' : 'Inactiva'}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {liga.plan}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas */}
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
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Jugadores</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.total_jugadores}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Partidos Totales</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.total_partidos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                    <MapPin className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Canchas</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.total_canchas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/equipos">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Gestionar Equipos
                  </Button>
                </Link>
                <Link href="/canchas">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Gestionar Canchas
                  </Button>
                </Link>
                <Link href="/partidos">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Programar Partidos
                  </Button>
                </Link>
                <Link href="/tabla-posiciones">
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="w-4 h-4 mr-2" />
                    Tabla de Posiciones
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Próximos Partidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Próximos Partidos</span>
                <Link href="/calendario">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver Todos
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proximosPartidos.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay próximos partidos programados
                </p>
              ) : (
                <div className="space-y-3">
                  {proximosPartidos.map((partido) => (
                    <div key={partido.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {partido.equipo_local?.nombre} vs {partido.equipo_visitante?.nombre}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(partido.fecha_jornada).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {partido.cancha && ` • ${partido.cancha.nombre}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Jornada {partido.jornada}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Administración (solo para adminadmin) */}
        {isAdminAdmin && liga && (
          <Card>
            <CardHeader>
              <CardTitle>Administración de Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Estado de Pago</h4>
                    <p className="text-sm text-gray-600">
                      Controla el estado de pago de la liga
                    </p>
                  </div>
                  <Button
                    onClick={() => cambiarEstadoPago(!liga.estatus_pago)}
                    variant={liga.estatus_pago ? "destructive" : "default"}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    {liga.estatus_pago ? 'Marcar como No Pagada' : 'Marcar como Pagada'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/admin/ligas">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Todas las Ligas
                    </Button>
                  </Link>
                  <Link href="/admin/pagos">
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Gestión de Pagos
                    </Button>
                  </Link>
                  <Link href="/admin/usuarios">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Gestión de Usuarios
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
