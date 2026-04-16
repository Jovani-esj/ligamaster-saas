'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Trophy, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Edit,
  Trash2,
  Shield,
  Crown,
  UserCheck,
  Activity,
  Loader2
} from 'lucide-react';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  descripcion: string;
  owner_id?: string;
  estatus_pago: boolean;
  plan: string;
  fecha_registro: string;
  fecha_vencimiento?: string;
  activa: boolean;
  created_at: string;
  owner?: {
    nombre?: string;
    apellido?: string;
    email?: string;
  };
  estadisticas?: {
    total_equipos: number;
    total_jugadores: number;
    total_partidos: number;
    partidos_jugados: number;
  };
}

interface UserProfile {
  id: string;
  user_id: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  rol: string;
  liga_id?: string;
  equipo_id?: string;
  es_capitan_equipo?: boolean;
  activo: boolean;
  created_at: string;
  email?: string;
}

export default function AdminAdminDashboard() {
  const { profile } = useSimpleAuth();
  
  // For simple auth, check if user has adminadmin or superadmin role
  const isAdminAdmin = profile?.rol === 'adminadmin' || profile?.rol === 'superadmin';
  const [loading, setLoading] = useState(true);
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    totalLigas: 0,
    ligasActivas: 0,
    ligasPagadas: 0,
    totalUsuarios: 0,
    totalEquipos: 0,
    totalJugadores: 0,
    totalPartidos: 0
  });

  const [vistaActual, setVistaActual] = useState<'dashboard' | 'ligas' | 'usuarios'>('dashboard');
  const [ligaSeleccionada, setLigaSeleccionada] = useState<Liga | null>(null);
  const [showSuspenderLiga, setShowSuspenderLiga] = useState(false);
  const [showEditarUsuario, setShowEditarUsuario] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isAdminAdmin) {
      cargarDatos();
    }
  }, [isAdminAdmin]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Usar API route con service role key (bypass RLS)
      const response = await fetch('/api/admin-stats');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setLigas(data.ligas || []);
      setUsuarios(data.usuarios || []);
      setEstadisticas(data.estadisticas || {
        totalLigas: 0,
        ligasActivas: 0,
        ligasPagadas: 0,
        totalUsuarios: 0,
        totalEquipos: 0,
        totalJugadores: 0,
        totalPartidos: 0
      });
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error(`Error al cargar los datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const suspenderLiga = async (ligaId: string, suspender: boolean) => {
    try {
      const { error } = await supabase
        .from('ligas')
        .update({ 
          activa: !suspender,
          estatus_pago: !suspender
        })
        .eq('id', ligaId);

      if (error) throw error;

      toast.success(suspender ? 'Liga suspendida exitosamente' : 'Liga reactivada exitosamente');
      await cargarDatos();
      setShowSuspenderLiga(false);
      setLigaSeleccionada(null);
    } catch (error) {
      console.error('Error suspendiendo liga:', error);
      toast.error('Error al cambiar estado de la liga');
    }
  };

  const actualizarUsuario = async (usuarioId: string, datos: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(datos)
        .eq('id', usuarioId);

      if (error) throw error;

      toast.success('Usuario actualizado exitosamente');
      await cargarDatos();
      setShowEditarUsuario(false);
      setUsuarioSeleccionado(null);
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      toast.error('Error al actualizar el usuario');
    }
  };

  const eliminarUsuario = async (usuarioId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ activo: false })
        .eq('id', usuarioId);

      if (error) throw error;

      toast.success('Usuario eliminado exitosamente');
      await cargarDatos();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      toast.error('Error al eliminar el usuario');
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Bronce': return 'bg-orange-100 text-orange-800';
      case 'Plata': return 'bg-gray-100 text-gray-800';
      case 'Oro': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'adminadmin': return 'bg-purple-100 text-purple-800';
      case 'admin_liga': return 'bg-blue-100 text-blue-800';
      case 'capitan_equipo': return 'bg-green-100 text-green-800';
      case 'usuario': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdminAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600">
              No tienes permisos de administrador para acceder a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600 text-lg">
            Gestión completa del sistema LigaMaster SaaS
          </p>
        </div>

        {/* Navegación */}
        <div className="flex space-x-4 mb-8">
          <Button
            onClick={() => setVistaActual('dashboard')}
            variant={vistaActual === 'dashboard' ? 'default' : 'outline'}
          >
            <Activity className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button
            onClick={() => setVistaActual('ligas')}
            variant={vistaActual === 'ligas' ? 'default' : 'outline'}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Ligas
          </Button>
          <Button
            onClick={() => setVistaActual('usuarios')}
            variant={vistaActual === 'usuarios' ? 'default' : 'outline'}
          >
            <Users className="w-4 h-4 mr-2" />
            Usuarios
          </Button>
        </div>

        {/* Vista Dashboard */}
        {vistaActual === 'dashboard' && (
          <div className="space-y-8">
            {/* Estadísticas Generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Trophy className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Total Ligas</p>
                      <p className="text-2xl font-bold">{estadisticas.totalLigas}</p>
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
                    <DollarSign className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Ligas Pagadas</p>
                      <p className="text-2xl font-bold">{estadisticas.ligasPagadas}</p>
                      <p className="text-xs text-gray-500">
                        {Math.round((estadisticas.ligasPagadas / estadisticas.totalLigas) * 100)}% del total
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Total Usuarios</p>
                      <p className="text-2xl font-bold">{estadisticas.totalUsuarios}</p>
                      <p className="text-xs text-gray-500">
                        Registrados en el sistema
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-orange-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Total Partidos</p>
                      <p className="text-2xl font-bold">{estadisticas.totalPartidos}</p>
                      <p className="text-xs text-gray-500">
                        Programados y jugados
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ligas Recientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Ligas Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ligas.slice(0, 5).map((liga) => (
                    <div key={liga.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{liga.nombre_liga}</p>
                          <p className="text-sm text-gray-500">
                            {liga.estadisticas?.total_equipos || 0} equipos • {liga.estadisticas?.total_jugadores || 0} jugadores
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(liga.plan)}`}>
                          {liga.plan}
                        </span>
                        {liga.estatus_pago ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vista Ligas */}
        {vistaActual === 'ligas' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Gestión de Ligas
              </CardTitle>
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
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estadísticas</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ligas.map((liga) => (
                      <tr key={liga.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{liga.nombre_liga}</p>
                            <p className="text-sm text-gray-500">{liga.slug}</p>
                            <p className="text-xs text-gray-400">
                              Creada: {new Date(liga.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              {liga.owner?.nombre} {liga.owner?.apellido}
                            </p>
                            <p className="text-sm text-gray-500">{liga.owner?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(liga.plan)}`}>
                            {liga.plan}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              {liga.activa ? (
                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500 mr-1" />
                              )}
                              <span className="text-sm text-gray-900">
                                {liga.activa ? 'Activa' : 'Inactiva'}
                              </span>
                            </div>
                            <div className="flex items-center">
                              {liga.estatus_pago ? (
                                <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                              )}
                              <span className="text-sm text-gray-900">
                                {liga.estatus_pago ? 'Pagada' : 'Pendiente'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            <p>{liga.estadisticas?.total_equipos || 0} equipos</p>
                            <p>{liga.estadisticas?.total_jugadores || 0} jugadores</p>
                            <p>{liga.estadisticas?.total_partidos || 0} partidos</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLigaSeleccionada(liga);
                                setShowSuspenderLiga(true);
                              }}
                              className={liga.activa ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                            >
                              {liga.activa ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vista Usuarios */}
        {vistaActual === 'usuarios' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Gestión de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Usuario</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Contacto</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Rol</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Registro</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {usuario.nombre} {usuario.apellido}
                              </p>
                              <p className="text-sm text-gray-500">ID: {usuario.user_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-gray-900">{usuario.email}</p>
                            {usuario.telefono && (
                              <p className="text-sm text-gray-500">{usuario.telefono}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRolColor(usuario.rol)}`}>
                            {usuario.rol === 'adminadmin' && <Crown className="w-3 h-3 mr-1" />}
                            {usuario.rol === 'admin_liga' && <Shield className="w-3 h-3 mr-1" />}
                            {usuario.rol === 'capitan_equipo' && <UserCheck className="w-3 h-3 mr-1" />}
                            {usuario.rol}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {usuario.activo ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span className="text-sm text-gray-900">
                              {usuario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-900">
                            {new Date(usuario.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setUsuarioSeleccionado(usuario);
                                setShowEditarUsuario(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {usuario.activo && usuario.rol !== 'adminadmin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => eliminarUsuario(usuario.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal Suspender Liga */}
        {showSuspenderLiga && ligaSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  {ligaSeleccionada.activa ? 'Suspender Liga' : 'Reactivar Liga'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {ligaSeleccionada.nombre_liga}
                    </h3>
                    <p className="text-gray-600">
                      {ligaSeleccionada.activa 
                        ? '¿Estás seguro de suspender esta liga? Se desactivará el acceso para todos los usuarios.'
                        : '¿Estás seguro de reactivar esta liga? Se restaurará el acceso para todos los usuarios.'
                      }
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => suspenderLiga(ligaSeleccionada.id, ligaSeleccionada.activa)}
                      className={ligaSeleccionada.activa ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                    >
                      {ligaSeleccionada.activa ? 'Suspender' : 'Reactivar'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowSuspenderLiga(false);
                        setLigaSeleccionada(null);
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal Editar Usuario */}
        {showEditarUsuario && usuarioSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Editar Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  actualizarUsuario(usuarioSeleccionado.id, {
                    rol: formData.get('rol') as string,
                    activo: formData.get('activo') === 'true'
                  });
                }} className="space-y-4">
                  <div>
                    <Label>Usuario</Label>
                    <p className="text-sm text-gray-900">
                      {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
                    </p>
                    <p className="text-sm text-gray-500">{usuarioSeleccionado.email}</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="rol">Rol</Label>
                    <select
                      id="rol"
                      name="rol"
                      defaultValue={usuarioSeleccionado.rol}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="usuario">Usuario</option>
                      <option value="capitan_equipo">Capitán de Equipo</option>
                      <option value="admin_liga">Administrador de Liga</option>
                      {usuarioSeleccionado.rol !== 'adminadmin' && (
                        <option value="adminadmin">Administrador del Sistema</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="activo">Estado</Label>
                    <select
                      id="activo"
                      name="activo"
                      defaultValue={usuarioSeleccionado.activo.toString()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <Button type="submit" className="flex-1">
                      Guardar Cambios
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowEditarUsuario(false);
                        setUsuarioSeleccionado(null);
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
