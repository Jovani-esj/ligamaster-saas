'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Plus, 
  Settings, 
  Search,
  Filter,
  Shield,
  Eye,
  LayoutDashboard,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  descripcion?: string;
  activa?: boolean;
  estatus_pago?: boolean;
  owner_id?: string;
  created_at?: string;
}

interface EstadisticasLigas {
  totalEquipos: number;
  totalJugadores: number;
  totalPartidos: number;
}

export default function LigasPage() {
  const { user, profile, loading: authLoading } = useSimpleAuth();
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [, setMisLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EstadisticasLigas>({ totalEquipos: 0, totalJugadores: 0, totalPartidos: 0 });
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');

  const isAuthenticated = !!user;
  const userRole = profile?.rol;
  const isAdmin = userRole === 'superadmin' || userRole === 'adminadmin';
  const isLigaAdmin = userRole === 'admin_liga';

  const cargarEstadisticas = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const [equiposRes, jugadoresRes, partidosRes] = await Promise.all([
        supabase.from('equipos').select('*', { count: 'exact', head: true }),
        supabase.from('jugadores').select('*', { count: 'exact', head: true }),
        supabase.from('partidos').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalEquipos: equiposRes.count || 0,
        totalJugadores: jugadoresRes.count || 0,
        totalPartidos: partidosRes.count || 0
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const cargarMisLigas = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const { data } = await supabase
        .from('ligas')
        .select('*')
        .eq('owner_id', profile?.id)
        .or(`id.eq.${profile?.liga_id}`);
      
      if (data) {
        setMisLigas(data);
      }
    } catch (error) {
      console.error('Error cargando mis ligas:', error);
    }
  };

  useEffect(() => {
    const fetchLigas = async () => {
      try {
        // Cargar ligas públicas (activas con pago al día)
        const response = await fetch('/api/ligas');
        const result = await response.json();
        
        if (result.data) {
          setLigas(result.data);
        }

        // Si está autenticado, cargar estadísticas adicionales
        if (isAuthenticated) {
          await cargarEstadisticas();
          
          // Si es admin de liga, cargar sus ligas específicas
          if (isLigaAdmin && profile?.liga_id) {
            await cargarMisLigas();
          }
        }
      } catch (error) {
        console.error('Error fetching leagues:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchLigas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, isLigaAdmin, profile?.liga_id]);

  // Filtrar ligas según búsqueda y filtros
  const ligasFiltradas = ligas.filter(liga => {
    const coincideBusqueda = !terminoBusqueda || 
      liga.nombre_liga.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      (liga.descripcion && liga.descripcion.toLowerCase().includes(terminoBusqueda.toLowerCase()));
    
    if (filtroEstado === 'todas') return coincideBusqueda;
    if (filtroEstado === 'activas') return coincideBusqueda && liga.activa;
    if (filtroEstado === 'inactivas') return coincideBusqueda && !liga.activa;
    if (filtroEstado === 'mis-ligas' && isAuthenticated) {
      return coincideBusqueda && (liga.owner_id === profile?.id || liga.id === profile?.liga_id);
    }
    return coincideBusqueda;
  });

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ligas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header con bienvenida si está autenticado */}
        <div className="mb-8">
          {isAuthenticated ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Hola, {profile?.nombre || user?.email}!
                </h1>
                <p className="text-gray-600">
                  {isAdmin 
                    ? 'Panel de administración de ligas' 
                    : isLigaAdmin 
                      ? 'Gestiona tus ligas y explora otras disponibles'
                      : 'Explora las ligas disponibles y únete a la competencia'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {(isAdmin || isLigaAdmin) && (
                  <Link href="/crear-liga">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Liga
                    </Button>
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/gestion-ligas">
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Gestionar Ligas
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Ligas Disponibles</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                Explora todas las ligas disponibles y únete a la competencia
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/auth/simple-login">
                  <Button variant="outline" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/simple-register">
                  <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Registrarse
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Stats mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mr-4">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ligas Activas</p>
                <p className="text-2xl font-bold text-gray-900">{ligas.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mr-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Equipos Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isAuthenticated ? stats.totalEquipos : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mr-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Partidos Jugados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isAuthenticated ? stats.totalPartidos : '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mr-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Jugadores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isAuthenticated ? stats.totalJugadores : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="w-5 h-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar ligas..."
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas las ligas</option>
                <option value="activas">Solo activas</option>
                {isAuthenticated && (
                  <option value="mis-ligas">Mis ligas</option>
                )}
              </select>

              <div className="flex items-center justify-between md:justify-end">
                <span className="text-sm text-gray-600">
                  Mostrando {ligasFiltradas.length} de {ligas.length} ligas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ligas Grid */}
        {ligasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ligasFiltradas.map((liga) => {
              const esMiLiga = liga.owner_id === profile?.id || liga.id === profile?.liga_id;
              const puedoGestionar = isAdmin || (isLigaAdmin && esMiLiga);
              
              return (
                <Card key={liga.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                      <Trophy className="h-8 w-8 text-blue-600" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                      {liga.nombre_liga}
                    </h3>

                    {/* Badge de propiedad para admins */}
                    {esMiLiga && isAuthenticated && (
                      <div className="text-center mb-3">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          <Shield className="w-3 h-3 mr-1" />
                          {liga.owner_id === profile?.id ? 'Tu Liga' : 'Tu Equipo'}
                        </span>
                      </div>
                    )}
                    
                    {liga.descripcion && (
                      <p className="text-gray-600 text-center mb-4 line-clamp-2 text-sm">
                        {liga.descripcion}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Creada:</span>
                        <span className="font-medium text-gray-900">
                          {liga.created_at ? new Date(liga.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Estado:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          liga.activa 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {liga.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Pago:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            liga.estatus_pago 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {liga.estatus_pago ? 'Al día' : 'Pendiente'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {/* Botón principal - siempre visible */}
                      <Link 
                        href={`/liga/${liga.slug}`}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ver Detalles</span>
                      </Link>
                      
                      {/* Botón de panel de control */}
                      <Link 
                        href={`/${liga.slug}`}
                        className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Panel</span>
                      </Link>

                      {/* Botón de gestión solo para admins propietarios */}
                      {puedoGestionar && (
                        <Link 
                          href={`/admin?liga=${liga.id}`}
                          className="w-full flex items-center justify-center space-x-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Gestionar</span>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
              <Trophy className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {terminoBusqueda || filtroEstado !== 'todas' 
                ? 'No se encontraron ligas con estos filtros'
                : 'No hay ligas disponibles'}
            </h3>
            <p className="text-gray-600 mb-4">
              {terminoBusqueda || filtroEstado !== 'todas'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No se encontraron ligas en este momento.'}
            </p>
            {(isAdmin || isLigaAdmin) && (
              <Link href="/crear-liga">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Nueva Liga
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* CTA para usuarios no autenticados al final */}
        {!isAuthenticated && ligasFiltradas.length > 0 && (
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ¿Quieres crear tu propia liga?
                </h3>
                <p className="text-gray-600 mb-4">
                  Regístrate gratis y comienza a gestionar tu propia liga de fútbol
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/auth/simple-login">
                    <Button variant="outline">Iniciar Sesión</Button>
                  </Link>
                  <Link href="/auth/simple-register">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Crear Cuenta
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
