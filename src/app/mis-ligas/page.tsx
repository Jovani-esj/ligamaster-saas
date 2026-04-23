'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import RouteProtection from '@/components/auth/RouteProtection';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { 
  Trophy, Users, Calendar, DollarSign, AlertCircle, CheckCircle, Settings,
  Plus, Edit, Trash2, BarChart3, MapPin, Eye, TrendingUp, Shield
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  descripcion?: string;
  plan: 'Bronce' | 'Plata' | 'Oro';
  estatus_pago: boolean;
  activa: boolean;
  fecha_registro: string;
  fecha_vencimiento?: string;
  owner_id?: string;
  total_equipos?: number;
  total_jugadores?: number;
  total_partidos?: number;
}

export default function MisLigasPage() {
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<Liga | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [stats, setStats] = useState({
    totalLigas: 0,
    activas: 0,
    inactivas: 0,
    pendientesPago: 0
  });
  const { user, profile } = useSimpleAuth();
  const router = useRouter();
  const isAdminLiga = profile?.rol === 'admin_liga';
  const isSuperAdmin = profile?.rol === 'superadmin' || profile?.rol === 'adminadmin';

  useEffect(() => {
    if (user?.id) {
      fetchLigas();
    }
  }, [user?.id]);

  const fetchLigas = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) return;

      // Buscar ligas donde el usuario es owner
      const { data: ligasData, error: ligasError } = await supabase
        .from('ligas')
        .select('*')
        .eq('owner_id', user.id)
        .order('fecha_registro', { ascending: false });

      if (ligasData && ligasData.length > 0) {
        // Cargar estadísticas para cada liga
        const ligasConStats = await Promise.all(
          ligasData.map(async (liga) => {
            const { count: equiposCount } = await supabase
              .from('equipos')
              .select('*', { count: 'exact', head: true })
              .eq('liga_id', liga.id)
              .eq('activo', true);

            const { count: jugadoresCount } = await supabase
              .from('jugadores')
              .select('*', { count: 'exact', head: true })
              .eq('liga_id', liga.id)
              .eq('activo', true);

            const { count: partidosCount } = await supabase
              .from('partidos')
              .select('*', { count: 'exact', head: true })
              .eq('liga_id', liga.id);

            return {
              ...liga,
              total_equipos: equiposCount || 0,
              total_jugadores: jugadoresCount || 0,
              total_partidos: partidosCount || 0
            };
          })
        );
        
        setLigas(ligasConStats);
        
        // Calcular estadísticas generales
        setStats({
          totalLigas: ligasConStats.length,
          activas: ligasConStats.filter(l => l.activa).length,
          inactivas: ligasConStats.filter(l => !l.activa).length,
          pendientesPago: ligasConStats.filter(l => !l.estatus_pago).length
        });
      } else {
        setLigas([]);
        setStats({ totalLigas: 0, activas: 0, inactivas: 0, pendientesPago: 0 });
      }
    } catch (error) {
      console.error('Error fetching ligas:', error);
      toast.error('Error al cargar las ligas');
    } finally {
      setLoading(false);
    }
  };

  const eliminarLiga = async (ligaId: string) => {
    try {
      const { error } = await supabase
        .from('ligas')
        .delete()
        .eq('id', ligaId);

      if (error) throw error;
      
      toast.success('Liga eliminada exitosamente');
      setShowDeleteConfirm(null);
      fetchLigas();
    } catch (error) {
      console.error('Error eliminando liga:', error);
      toast.error('Error al eliminar la liga');
    }
  };

  const toggleEstadoLiga = async (liga: Liga) => {
    try {
      const { error } = await supabase
        .from('ligas')
        .update({ activa: !liga.activa })
        .eq('id', liga.id);

      if (error) throw error;
      
      toast.success(`Liga ${liga.activa ? 'desactivada' : 'activada'} exitosamente`);
      fetchLigas();
    } catch (error) {
      console.error('Error actualizando liga:', error);
      toast.error('Error al actualizar la liga');
    }
  };

  const guardarEdicionLiga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    try {
      const { error } = await supabase
        .from('ligas')
        .update({
          nombre_liga: showEditModal.nombre_liga,
          descripcion: showEditModal.descripcion,
          plan: showEditModal.plan,
          estatus_pago: showEditModal.estatus_pago
        })
        .eq('id', showEditModal.id);

      if (error) throw error;
      
      toast.success('Liga actualizada exitosamente');
      setShowEditModal(null);
      fetchLigas();
    } catch (error) {
      console.error('Error actualizando liga:', error);
      toast.error('Error al actualizar la liga');
    }
  };

  const duplicarLiga = async (liga: Liga) => {
    if (!user?.id) return;
    
    try {
      // Crear nueva liga con datos similares
      const nuevaLiga = {
        nombre_liga: `${liga.nombre_liga} (Copia)`,
        slug: `${liga.slug}-copia-${Date.now()}`,
        descripcion: liga.descripcion,
        plan: liga.plan,
        owner_id: user.id,
        creado_por: user.id,
        activa: false,
        estatus_pago: false,
        fecha_registro: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ligas')
        .insert([nuevaLiga])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Liga duplicada exitosamente. Revisa la copia en tu lista.');
      fetchLigas();
    } catch (error) {
      console.error('Error duplicando liga:', error);
      toast.error('Error al duplicar la liga');
    }
  };

  // Filtrar ligas
  const ligasFiltradas = ligas.filter(liga => {
    const coincideBusqueda = liga.nombre_liga.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           liga.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const coincidePlan = filterPlan === 'todos' || liga.plan === filterPlan;
    const coincideEstado = filterEstado === 'todos' || 
                          (filterEstado === 'activa' && liga.activa) ||
                          (filterEstado === 'inactiva' && !liga.activa) ||
                          (filterEstado === 'pendiente' && !liga.estatus_pago);
    
    return coincideBusqueda && coincidePlan && coincideEstado;
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Oro': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Plata': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'Bronce': return 'text-orange-600 bg-orange-100 border-orange-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'Oro': return <Trophy className="w-6 h-6 text-yellow-600" />;
      case 'Plata': return <Trophy className="w-6 h-6 text-gray-500" />;
      case 'Bronce': return <Trophy className="w-6 h-6 text-orange-600" />;
      default: return <Trophy className="w-6 h-6 text-blue-600" />;
    }
  };

  const isVencida = (fechaVencimiento?: string) => {
    if (!fechaVencimiento) return false;
    return new Date(fechaVencimiento) < new Date();
  };

  if (loading) {
    return (
      <RouteProtection requireAuth={true}>
        <div className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus ligas...</p>
          </div>
        </div>
      </RouteProtection>
    );
  }

  return (
    <RouteProtection requireAuth={true}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-600" />
                Mis Ligas
              </h1>
              <p className="text-gray-600">
                Gestiona las ligas que has creado y administras
              </p>
            </div>
            <Link href="/crear-liga">
              <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                <Plus className="w-5 h-5 mr-2" />
                Crear Nueva Liga
              </Button>
            </Link>
          </div>

          {/* Estadísticas Generales */}
          {ligas.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white">
                <CardContent className="p-4 flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <Trophy className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalLigas}</p>
                    <p className="text-sm text-gray-600">Total Ligas</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-4 flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg mr-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activas}</p>
                    <p className="text-sm text-gray-600">Activas</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-4 flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg mr-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.inactivas}</p>
                    <p className="text-sm text-gray-600">Inactivas</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-4 flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pendientesPago}</p>
                    <p className="text-sm text-gray-600">Pendientes Pago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros y Búsqueda */}
          {ligas.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Buscar ligas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterPlan}
                      onChange={(e) => setFilterPlan(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todos los planes</option>
                      <option value="Bronce">Bronce</option>
                      <option value="Plata">Plata</option>
                      <option value="Oro">Oro</option>
                    </select>
                    <select
                      value={filterEstado}
                      onChange={(e) => setFilterEstado(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="activa">Activas</option>
                      <option value="inactiva">Inactivas</option>
                      <option value="pendiente">Pendientes Pago</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {ligas.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tienes ligas creadas
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Como administrador de liga, puedes crear y gestionar tus propias ligas. 
                  Comienza creando tu primera liga.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/crear-liga">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                      <Plus className="w-5 h-5 mr-2" />
                      Crear Liga
                    </Button>
                  </Link>
                  <Link href="/ligas">
                    <Button variant="outline" className="text-lg px-8">
                      <Eye className="w-5 h-5 mr-2" />
                      Ver Ligas Existentes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : ligasFiltradas.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-gray-600">No se encontraron ligas con los filtros aplicados.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterPlan('todos');
                    setFilterEstado('todos');
                  }}
                >
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {ligasFiltradas.map((liga) => (
                <Card key={liga.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getPlanIcon(liga.plan)}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                            {liga.nombre_liga}
                          </h3>
                          <p className="text-sm text-gray-500">/{liga.slug}</p>
                        </div>
                      </div>
                      <Badge className={getPlanColor(liga.plan)}>
                        {liga.plan}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(liga.fecha_registro).toLocaleDateString()}
                      </div>
                      {liga.fecha_vencimiento && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {new Date(liga.fecha_vencimiento).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Estadísticas */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Users className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                        <p className="text-lg font-bold text-gray-900">{liga.total_equipos || 0}</p>
                        <p className="text-xs text-gray-600">Equipos</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Trophy className="w-5 h-5 mx-auto mb-1 text-green-600" />
                        <p className="text-lg font-bold text-gray-900">{liga.total_jugadores || 0}</p>
                        <p className="text-xs text-gray-600">Jugadores</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                        <p className="text-lg font-bold text-gray-900">{liga.total_partidos || 0}</p>
                        <p className="text-xs text-gray-600">Partidos</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {liga.activa && liga.estatus_pago ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-600 font-medium">Activa</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <span className="text-red-600 font-medium">
                              {!liga.activa ? 'Inactiva' : 'Suspendida'}
                            </span>
                          </>
                        )}
                      </div>
                      <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        Admin
                      </Badge>
                    </div>

                    {isVencida(liga.fecha_vencimiento) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-red-800 text-sm">
                          <strong>⚠️ Atención:</strong> Suscripción vencida.
                        </p>
                      </div>
                    )}

                    {!liga.estatus_pago && !isVencida(liga.fecha_vencimiento) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-yellow-800 text-sm">
                          <strong>⚠️ Atención:</strong> Suspendida por falta de pago.
                        </p>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Link href={`/${liga.slug}`} className="flex-1">
                          <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setShowEditModal(liga)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => toggleEstadoLiga(liga)}
                        >
                          {liga.activa ? (
                            <>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activar
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => duplicarLiga(liga)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Duplicar
                        </Button>
                      </div>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => setShowDeleteConfirm(liga.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Liga
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="w-6 h-6 mr-2 text-blue-600" />
                Editar Liga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={guardarEdicionLiga} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Liga
                  </label>
                  <input
                    type="text"
                    value={showEditModal.nombre_liga}
                    onChange={(e) => setShowEditModal({...showEditModal, nombre_liga: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={showEditModal.descripcion || ''}
                    onChange={(e) => setShowEditModal({...showEditModal, descripcion: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan
                  </label>
                  <select
                    value={showEditModal.plan}
                    onChange={(e) => setShowEditModal({...showEditModal, plan: e.target.value as 'Bronce' | 'Plata' | 'Oro'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Bronce">Bronce</option>
                    <option value="Plata">Plata</option>
                    <option value="Oro">Oro</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_estatus_pago"
                    checked={showEditModal.estatus_pago}
                    onChange={(e) => setShowEditModal({...showEditModal, estatus_pago: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="edit_estatus_pago" className="text-sm text-gray-700">
                    Liga con pago al día
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowEditModal(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertCircle className="w-6 h-6 mr-2" />
                Confirmar Eliminación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar esta liga? Esta acción no se puede deshacer y se perderán todos los datos asociados (equipos, jugadores, partidos).
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => eliminarLiga(showDeleteConfirm)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </RouteProtection>
  );
}
