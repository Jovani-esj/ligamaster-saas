'use client';
import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp,
  Download,
  Shield,
  Crown,
  Loader2,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface EstadisticasSistema {
  totalLigas: number;
  totalEquipos: number;
  totalJugadores: number;
  totalPartidos: number;
  ligasActivas: number;
  ligasPagadas: number;
}

export default function ReportesPage() {
  const { profile } = useSimpleAuth();
  const [estadisticas, setEstadisticas] = useState<EstadisticasSistema | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.rol === 'adminadmin' || profile?.rol === 'superadmin';

  useEffect(() => {
    if (isAdmin) {
      cargarEstadisticas();
    }
  }, [isAdmin]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas de manera segura (sin service role)
      const { data: ligas } = await supabase.from('ligas').select('id, activa, estatus_pago');
      const { data: equipos } = await supabase.from('equipos').select('id');
      const { data: jugadores } = await supabase.from('jugadores').select('id');
      const { data: partidos } = await supabase.from('partidos').select('id');

      setEstadisticas({
        totalLigas: ligas?.length || 0,
        totalEquipos: equipos?.length || 0,
        totalJugadores: jugadores?.length || 0,
        totalPartidos: partidos?.length || 0,
        ligasActivas: ligas?.filter(l => l.activa).length || 0,
        ligasPagadas: ligas?.filter(l => l.estatus_pago).length || 0
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const exportarReporte = () => {
    if (!estadisticas) return;
    
    const data = {
      fecha: new Date().toISOString(),
      estadisticas,
      generadoPor: (profile as unknown as { email?: string })?.email || 'Admin'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-sistema-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Reporte exportado exitosamente');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600 mb-6">
              Solo administradores del sistema pueden acceder a los reportes.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Volver al Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando reportes...</p>
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
                Reportes del Sistema
              </h1>
              <p className="text-gray-600">
                Estadísticas y reportes de LigaMaster
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={exportarReporte} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar JSON
              </Button>
              <Link href="/admin-admin">
                <Button variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Panel Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {estadisticas && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                      <Trophy className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Ligas</p>
                      <p className="text-2xl font-bold text-gray-900">{estadisticas.totalLigas}</p>
                      <p className="text-xs text-green-600">{estadisticas.ligasActivas} activas</p>
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
                      <p className="text-sm font-medium text-gray-600">Total Equipos</p>
                      <p className="text-2xl font-bold text-gray-900">{estadisticas.totalEquipos}</p>
                      <p className="text-xs text-gray-500">{estadisticas.totalJugadores} jugadores</p>
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
                      <p className="text-sm font-medium text-gray-600">Total Partidos</p>
                      <p className="text-2xl font-bold text-gray-900">{estadisticas.totalPartidos}</p>
                      <p className="text-xs text-gray-500">Programados y jugados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reportes Detallados */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Resumen Financiero
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Ligas Pagadas</span>
                      <Badge variant="default" className="text-lg">
                        {estadisticas.ligasPagadas}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Ligas con Pago Pendiente</span>
                      <Badge variant="destructive" className="text-lg">
                        {estadisticas.totalLigas - estadisticas.ligasPagadas}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="text-blue-900 font-medium">Tasa de Conversión</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {estadisticas.totalLigas > 0 
                          ? Math.round((estadisticas.ligasPagadas / estadisticas.totalLigas) * 100) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Actividad del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Promedio Equipos por Liga</span>
                      <span className="text-xl font-bold text-gray-900">
                        {estadisticas.totalLigas > 0 
                          ? (estadisticas.totalEquipos / estadisticas.totalLigas).toFixed(1) 
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Promedio Jugadores por Equipo</span>
                      <span className="text-xl font-bold text-gray-900">
                        {estadisticas.totalEquipos > 0 
                          ? (estadisticas.totalJugadores / estadisticas.totalEquipos).toFixed(1) 
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Partidos por Liga (promedio)</span>
                      <span className="text-xl font-bold text-gray-900">
                        {estadisticas.totalLigas > 0 
                          ? (estadisticas.totalPartidos / estadisticas.totalLigas).toFixed(1) 
                          : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reporte de Actividad */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Resumen General del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-600">
                    Este reporte fue generado el {new Date().toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}.
                  </p>
                  <p className="text-gray-600 mt-4">
                    El sistema cuenta actualmente con <strong>{estadisticas.totalLigas} ligas</strong>,
                    de las cuales <strong>{estadisticas.ligasActivas} están activas</strong> y{' '}
                    <strong>{estadisticas.ligasPagadas} tienen su pago al día</strong>.
                  </p>
                  <p className="text-gray-600 mt-2">
                    Hay un total de <strong>{estadisticas.totalEquipos} equipos</strong> registrados
                    con <strong>{estadisticas.totalJugadores} jugadores</strong> participando en{' '}
                    <strong>{estadisticas.totalPartidos} partidos</strong> programados.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
