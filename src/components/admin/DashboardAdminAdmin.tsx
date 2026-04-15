'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthenticationSystem';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DollarSign, 
  Users, 
  Trophy, 
  TrendingUp,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Crown,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface EstadisticasGlobales {
  total_ligas: number;
  ligas_activas: number;
  ligas_pagadas: number;
  total_usuarios: number;
  total_equipos: number;
  total_jugadores: number;
  ingresos_mensuales: number;
  ligas_por_pagar: number;
}

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  estatus_pago: boolean;
  activa: boolean;
  plan: string;
  fecha_registro: string;
  fecha_vencimiento?: string;
  owner_id?: string;
  owner_name?: string;
}

export default function DashboardAdminAdmin() {
  const { user, profile, isAdminAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticasGlobales | null>(null);
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'pagadas' | 'no_pagadas'>('todas');

  useEffect(() => {
    if (user && isAdminAdmin) {
      cargarDatosAdmin();
    }
  }, [user, isAdminAdmin]);

  const cargarDatosAdmin = async () => {
    try {
      // Cargar estadísticas globales
      await cargarEstadisticasGlobales();
      
      // Cargar todas las ligas
      await cargarLigas();
    } catch (error) {
      console.error('Error cargando datos de admin:', error);
      toast.error('Error al cargar los datos de administración');
    } finally {
      setLoading(false);
    }
  };

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

      const { data: jugadoresData } = await supabase
        .from('jugadores')
        .select('id')
        .eq('activo', true);

      // Calcular estadísticas
      const totalLigas = ligasData?.length || 0;
      const ligasActivas = ligasData?.filter(l => l.activa).length || 0;
      const ligasPagadas = ligasData?.filter(l => l.estatus_pago).length || 0;
      const ligasPorPagar = ligasActivas - ligasPagadas;

      // Calcular ingresos mensuales (simulado basado en planes)
      const precios = { Bronce: 100, Plata: 200, Oro: 500 };
      const ingresosMensuales = ligasData?.reduce((total, liga) => {
        return total + (precios[liga.plan as keyof typeof precios] || 100);
      }, 0) || 0;

      setEstadisticas({
        total_ligas: totalLigas,
        ligas_activas: ligasActivas,
        ligas_pagadas: ligasPagadas,
        total_usuarios: usuariosData?.length || 0,
        total_equipos: equiposData?.length || 0,
        total_jugadores: jugadoresData?.length || 0,
        ingresos_mensuales: ingresosMensuales,
        ligas_por_pagar: ligasPorPagar
      });
    } catch (error) {
      console.error('Error cargando estadísticas globales:', error);
    }
  };

  const cargarLigas = async () => {
    try {
      const { data, error } = await supabase
        .from('ligas')
        .select(`
          *,
          owner:user_profiles!ligas_owner_id_fkey(nombre, email)
        `)
        .order('fecha_registro', { ascending: false });

      if (error) throw error;

      const ligasConOwner = data?.map(liga => ({
        ...liga,
        owner_name: liga.owner?.nombre || 'Sin asignar'
      })) || [];

      setLigas(ligasConOwner);
    } catch (error) {
      console.error('Error cargando ligas:', error);
    }
  };

  const cambiarEstadoPago = async (ligaId: string, nuevoEstado: boolean) => {
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
        .eq('id', ligaId);

      if (error) throw error;

      toast.success(nuevoEstado ? 'Liga marcada como pagada' : 'Liga marcada como no pagada');
      await cargarDatosAdmin();
    } catch (error) {
      console.error('Error cambiando estado de pago:', error);
      toast.error('Error al cambiar el estado de pago');
    }
  };

  const cambiarEstadoLiga = async (ligaId: string, activa: boolean) => {
    const confirmacion = activa 
      ? '¿Estás seguro de activar esta liga?'
      : '¿Estás seguro de desactivar esta liga?';
    
    if (!confirm(confirmacion)) return;

    try {
      const { error } = await supabase
        .from('ligas')
        .update({ activa })
        .eq('id', ligaId);

      if (error) throw error;

      toast.success(activa ? 'Liga activada' : 'Liga desactivada');
      await cargarDatosAdmin();
    } catch (error) {
      console.error('Error cambiando estado de liga:', error);
      toast.error('Error al cambiar el estado de la liga');
    }
  };

  const ligasFiltradas = ligas.filter(liga => {
    const coincideBusqueda = liga.nombre_liga.toLowerCase().includes(busqueda.toLowerCase()) ||
                         liga.owner_name?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideEstado = filtroEstado === 'todas' ||
                         (filtroEstado === 'pagadas' && liga.estatus_pago) ||
                         (filtroEstado === 'no_pagadas' && !liga.estatus_pago);
    
    return coincideBusqueda && coincideEstado;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard de administración...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600">
              Esta sección es exclusiva para administradores del sistema.
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Crown className="w-8 h-8 mr-3 text-yellow-500" />
                Dashboard de Administración
              </h1>
              <p className="text-gray-600">
                Gestión completa del sistema LigaMaster
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
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.total_ligas}</p>
                    <p className="text-xs text-green-600">
                      {estadisticas.ligas_activas} activas
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
                      ${estadisticas.ingresos_mensuales.toLocaleString()}
                    </p>
                    <p className="text-xs text-red-600">
                      {estadisticas.ligas_por_pagar} por pagar
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
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.total_usuarios}</p>
                    <p className="text-xs text-gray-500">
                      {estadisticas.total_equipos} equipos • {estadisticas.total_jugadores} jugadores
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {estadisticas.total_ligas > 0 
                        ? Math.round((estadisticas.ligas_pagadas / estadisticas.total_ligas) * 100)
                        : 0}%
                    </p>
                    <p className="text-xs text-gray-500">
                      Ligas pagadas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gestión de Ligas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Gestión de Ligas</CardTitle>
              <div className="flex space-x-3">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="busqueda">Buscar:</Label>
                  <Input
                    id="busqueda"
                    type="text"
                    placeholder="Nombre o administrador..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-64"
                  />
                </div>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todas">Todas las ligas</option>
                  <option value="pagadas">Ligas pagadas</option>
                  <option value="no_pagadas">Ligas no pagadas</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Liga</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Administrador</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fecha Registro</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ligasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No se encontraron ligas
                      </td>
                    </tr>
                  ) : (
                    ligasFiltradas.map((liga) => (
                      <tr key={liga.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{liga.nombre_liga}</p>
                            <p className="text-sm text-gray-500">/{liga.slug}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{liga.owner_name}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {liga.plan}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              liga.estatus_pago 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {liga.estatus_pago ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Pagada
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  No Pagada
                                </>
                              )}
                            </span>
                            <br />
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              liga.activa 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {liga.activa ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-600">
                            {new Date(liga.fecha_registro).toLocaleDateString('es-MX')}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cambiarEstadoPago(liga.id, !liga.estatus_pago)}
                              className={liga.estatus_pago ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                            >
                              <CreditCard className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cambiarEstadoLiga(liga.id, !liga.activa)}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Link href={`/${liga.slug}`}>
                              <Button variant="outline" size="sm">
                                <BarChart3 className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
