'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Shield, 
  Crown,
  Users,
  Settings,
  Activity,
  TrendingUp
} from 'lucide-react';

import { PermisosRol } from '@/types/database';
import { SimpleProfile } from '@/components/auth/SimpleAuthenticationSystem';

interface AdminAdminDashboardProps {
  profile: SimpleProfile | null;
  permisos: PermisosRol | null;
}

interface EstadisticasAdmin {
  totalLigas: number;
  ligasActivas: number;
  ligasPagadas: number;
  totalUsuarios: number;
  totalEquipos: number;
  totalJugadores: number;
  ingresosMensuales: number;
}

export default function AdminAdminDashboard({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  profile, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  permisos 
}: AdminAdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticasAdmin>({
    totalLigas: 0,
    ligasActivas: 0,
    ligasPagadas: 0,
    totalUsuarios: 0,
    totalEquipos: 0,
    totalJugadores: 0,
    ingresosMensuales: 0
  });

  useEffect(() => {
    cargarEstadisticasAdmin();
  }, []);

  const cargarEstadisticasAdmin = async () => {
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

      const { data: jugadoresData } = await supabase
        .from('jugadores')
        .select('id')
        .eq('activo', true);

      // Calcular estadísticas
      const totalLigas = ligasData?.length || 0;
      const ligasActivas = ligasData?.filter(l => l.activa).length || 0;
      const ligasPagadas = ligasData?.filter(l => l.estatus_pago).length || 0;
      const totalUsuarios = usuariosData?.length || 0;

      // Calcular ingresos mensuales (simulado basado en planes)
      const precios = { Bronce: 100, Plata: 200, Oro: 500 };
      const ingresosMensuales = ligasData?.reduce((total, liga) => {
        return total + (precios[liga.plan as keyof typeof precios] || 100);
      }, 0) || 0;

      setEstadisticas({
        totalLigas,
        ligasActivas,
        ligasPagadas,
        totalUsuarios,
        totalEquipos: equiposData?.length || 0,
        totalJugadores: jugadoresData?.length || 0,
        ingresosMensuales
      });
    } catch (error) {
      console.error('Error cargando estadísticas de admin:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard de Admin...</p>
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
                Panel de Administrador
              </h1>
              <p className="text-gray-600">
                Gestión de ligas del sistema
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Admin Admin
              </span>
            </div>
          </div>
        </div>

        {/* Estadísticas Globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <Shield className="w-6 h-6 text-blue-600" />
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
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${estadisticas.ingresosMensuales.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {estadisticas.ligasPagadas} pagadas
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
                    En el sistema
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
                    {estadisticas.totalJugadores} jugadores
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Gestión de Ligas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/admin-admin">
                  <Button className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Administrar Ligas
                  </Button>
                </Link>
                <Link href="/buscar">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
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
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Administrar Usuarios
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  Ver Actividad
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
