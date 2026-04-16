import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Trophy, 
  Users, 
  DollarSign, 
  Settings, 
  Crown,
  Activity,
  TrendingUp,
  Shield,
  Database,
  Globe
} from 'lucide-react';
import type { EstadisticasGlobales, ActividadReciente } from '@/types/dashboard';

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticasGlobales | null>(null);
  const [actividadReciente, setActividadReciente] = useState<ActividadReciente[]>([]);

  useEffect(() => {
    cargarEstadisticasGlobales();
    cargarActividadReciente();
  }, []);

  const cargarEstadisticasGlobales = async () => {
    try {
      // Obtener estadísticas de ligas
      const { data: ligasData, error: ligasError } = await supabase
        .from('ligas')
        .select('*');

      if (ligasError) throw ligasError;

      // Obtener estadísticas de usuarios
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('user_profiles')
        .select('rol, activo')
        .eq('activo', true);

      if (usuariosError) throw usuariosError;

      // Obtener estadísticas de equipos y jugadores
      const { data: equiposData } = await supabase
        .from('equipos')
        .select('id')
        .eq('activo', true);

      // Note: jugadoresData fetch is available if needed for future stats
      // const { data: jugadoresData } = await supabase
      //   .from('jugadores')
      //   .select('id')
      //   .eq('activo', true);

      // Calcular estadísticas
      const totalLigas = ligasData?.length || 0;
      const ligasActivas = ligasData?.filter(l => l.activa).length || 0;
      // Note: ligasPagadas, totalSuperadmins, totalAdmins available for future stats
      // const ligasPagadas = ligasData?.filter(l => l.estatus_pago).length || 0;
      const totalUsuarios = usuariosData?.length || 0;
      // const totalSuperadmins = usuariosData?.filter(u => u.rol === 'superadmin').length || 0;
      // const totalAdmins = usuariosData?.filter(u => u.rol === 'adminadmin' || u.rol === 'admin_liga').length || 0;

      // Note: ingresosMensuales calculation available if needed
      // const precios = { Bronce: 100, Plata: 200, Oro: 500 };
      // const ingresosMensuales = ligasData?.reduce((total, liga) => {
      //   return total + (precios[liga.plan as keyof typeof precios] || 100);
      // }, 0) || 0;

      setEstadisticas({
        totalLigas: totalLigas,
        ligasActivas: ligasActivas,
        totalUsuarios: totalUsuarios,
        totalEquipos: equiposData?.length || 0,
        totalPartidos: 0, // Placeholder since we don't have partidos data here
        usuariosActivos: totalUsuarios
      });
    } catch (error) {
      console.error('Error cargando estadísticas globales:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarActividadReciente = async () => {
    try {
      // Simular actividad reciente o obtener de logs
      const { data } = await supabase
        .from('ligas')
        .select('nombre_liga, created_at, owner_id')
        .order('created_at', { ascending: false })
        .limit(5);

      // Transform data to match ActividadReciente interface
      interface LigaData {
        nombre_liga: string;
        created_at: string;
        owner_id: string;
      }
      const actividadFormateada: ActividadReciente[] = (data || []).map((liga: LigaData, index) => ({
        id: `liga-${index}`,
        tipo: 'liga' as const,
        descripcion: `Nueva liga creada: ${liga.nombre_liga}`,
        timestamp: liga.created_at,
        usuario: liga.owner_id
      }));

      setActividadReciente(actividadFormateada);
    } catch (error) {
      console.error('Error cargando actividad reciente:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard de SuperAdmin...</p>
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
                <Shield className="w-8 h-8 mr-3 text-purple-600" />
                Panel de SuperAdmin
              </h1>
              <p className="text-gray-600">
                Control total del sistema LigaMaster
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                SuperAdmin
              </span>
            </div>
          </div>
        </div>

        {/* Estadísticas Globales */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <Trophy className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Ligas</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.totalLigas}</p>
                    <p className="text-xs text-green-600">
                      {estadisticas.ligasActivas} activas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      $0 {/* Placeholder since ingresos_mensuales is not in interface */}
                    </p>
                    <p className="text-xs text-gray-500">
                      {estadisticas.ligasActivas} activas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.totalUsuarios}</p>
                    <p className="text-xs text-gray-500">
                      {/* Placeholder for role breakdown */}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Equipos y Jugadores</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.totalEquipos}</p>
                    <p className="text-xs text-gray-500">
                      {/* Placeholder for jugadores count */}
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
                <Globe className="w-5 h-5 mr-2" />
                Gestión de Ligas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/admin-admin">
                  <Button className="w-full justify-start">
                    <Crown className="w-4 h-4 mr-2" />
                    Admin de Ligas
                  </Button>
                </Link>
                <Link href="/ligas">
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="w-4 h-4 mr-2" />
                    Ver Todas las Ligas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Gestión de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/admin-admin">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Administrar Usuarios
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Ver Actividad
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Estadísticas Avanzadas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actividadReciente.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
              ) : (
                actividadReciente.map((actividad, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {actividad.descripcion}
                      </p>
                      <p className="text-sm text-gray-500">
                        {actividad.timestamp && new Date(actividad.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {actividad.timestamp && new Date(actividad.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
