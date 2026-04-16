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
  Clock,
  ChevronDown,
  CheckCircle,
  XCircle,
  Building2,
  DollarSign,
  Settings
} from 'lucide-react';
import { EstadisticasLiga, Liga, Equipo, Partido, PermisosRol } from '@/types/database';
import { SimpleProfile, SimpleUser } from '@/components/auth/SimpleAuthenticationSystem';

interface AdminLigaDashboardProps {
  profile: SimpleProfile | null;
  permisos: PermisosRol | null;
  user: SimpleUser | null;
}

export default function AdminLigaDashboard({ profile, permisos, user }: AdminLigaDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticasLiga | null>(null);
  const [ligaSeleccionada, setLigaSeleccionada] = useState<Liga | null>(null);
  const [misLigas, setMisLigas] = useState<Liga[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equiposPendientes, setEquiposPendientes] = useState<Equipo[]>([]);
  const [proximosPartidos, setProximosPartidos] = useState<Partido[]>([]);
  const [showSelectorLigas, setShowSelectorLigas] = useState(false);

  // Cargar las ligas del admin (creadas por él)
  useEffect(() => {
    if (user?.id) {
      cargarMisLigas();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarMisLigas = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Buscar ligas donde el usuario es el creador/administrador
      const { data: ligasData, error: ligasError } = await supabase
        .from('ligas')
        .select('*')
        .eq('creado_por', user.id)
        .order('created_at', { ascending: false });

      if (ligasError) {
        // Si no existe la columna creado_por, intentar con user_id
        const { data: ligasData2, error: ligasError2 } = await supabase
          .from('ligas')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (ligasError2) throw ligasError2;
        setMisLigas(ligasData2 || []);
        
        if (ligasData2 && ligasData2.length > 0) {
          setLigaSeleccionada(ligasData2[0]);
          await cargarDatosLiga(ligasData2[0].id);
        }
      } else {
        setMisLigas(ligasData || []);
        
        if (ligasData && ligasData.length > 0) {
          setLigaSeleccionada(ligasData[0]);
          await cargarDatosLiga(ligasData[0].id);
        }
      }
    } catch (error) {
      console.error('Error cargando ligas del admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosLiga = async (ligaId: string) => {
    if (!ligaId) return;

    try {
      setLoading(true);

      // Cargar estadísticas de la liga
      const { data: statsData } = await supabase
        .from('vista_estadisticas_liga')
        .select('*')
        .eq('liga_id', ligaId)
        .single();

      // Cargar equipos activos
      const { data: equiposData } = await supabase
        .from('equipos')
        .select('*')
        .eq('liga_id', ligaId)
        .eq('activo', true)
        .eq('estado', 'aprobado')
        .order('created_at', { ascending: false })
        .limit(5);

      // Cargar equipos pendientes de aprobación
      const { data: pendientesData } = await supabase
        .from('equipos')
        .select('*')
        .eq('liga_id', ligaId)
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: false });

      // Cargar partidos
      const { data: proximosData } = await supabase
        .from('partidos')
        .select('*')
        .eq('liga_id', ligaId)
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
      setEquiposPendientes(pendientesData || []);
      setProximosPartidos(proximosData || []);
    } catch (error) {
      console.error('Error cargando datos de liga:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarLiga = async (liga: Liga) => {
    setLigaSeleccionada(liga);
    setShowSelectorLigas(false);
    await cargarDatosLiga(liga.id);
  };

  const aprobarEquipo = async (equipoId: string, aprobar: boolean) => {
    try {
      const { error } = await supabase
        .from('equipos')
        .update({ 
          estado: aprobar ? 'aprobado' : 'rechazado',
          activo: aprobar 
        })
        .eq('id', equipoId);

      if (error) throw error;
      
      // Recargar datos
      if (ligaSeleccionada) {
        await cargarDatosLiga(ligaSeleccionada.id);
      }
    } catch (error) {
      console.error('Error actualizando equipo:', error);
      alert('Error al procesar la solicitud');
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

  // Vista cuando no tiene ligas creadas
  if (misLigas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
              <Shield className="w-8 h-8 mr-3 text-blue-600" />
              Panel de Administrador de Liga
            </h1>
            <p className="text-gray-600">
              Bienvenido, {profile?.nombre || user?.email}
            </p>
          </div>

          <Card className="text-center p-8 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Crea tu Primera Liga</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Como administrador de liga, puedes crear y gestionar tus propias ligas. 
              Comienza creando tu primera liga para empezar a administrar equipos, partidos y más.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin/crear-liga">
                <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Nueva Liga
                </Button>
              </Link>
              <Link href="/ligas">
                <Button variant="outline" className="text-lg px-8 py-3">
                  <Eye className="w-5 h-5 mr-2" />
                  Ver Ligas Existentes
                </Button>
              </Link>
            </div>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gestiona Equipos</h3>
              <p className="text-sm text-gray-600">Acepta o rechaza solicitudes de equipos que quieran unirse a tu liga</p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Programa Partidos</h3>
              <p className="text-sm text-gray-600">Crea roles de juego y gestiona el calendario de tu liga</p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Control Total</h3>
              <p className="text-sm text-gray-600">Administra canchas, jugadores y toda la configuración de tu liga</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Seguridad: si no hay liga seleccionada, no renderizar nada
  if (!ligaSeleccionada) {
    return null;
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
                Gestión de liga: <span className="font-semibold">{ligaSeleccionada.nombre_liga}</span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={ligaSeleccionada.estatus_pago ? 'bg-green-500' : 'bg-red-500'}>
                {ligaSeleccionada.estatus_pago ? 'Pagada' : 'No Pagada'}
              </Badge>
              <Badge className={ligaSeleccionada.activa ? 'bg-blue-500' : 'bg-gray-500'}>
                {ligaSeleccionada.activa ? 'Activa' : 'Inactiva'}
              </Badge>
              <Badge className="bg-purple-500">
                {ligaSeleccionada.plan}
              </Badge>
              {misLigas.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSelectorLigas(!showSelectorLigas)}
                >
                  Cambiar Liga
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              )}
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
                <Link href={`/${ligaSeleccionada.slug}/equipos`}>
                  <Button className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Equipos ({estadisticas?.total_equipos || 0})
                  </Button>
                </Link>
                {permisos?.puede_crear_equipos && (
                  <Link href={`/${ligaSeleccionada.slug}/equipos/nuevo`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Equipo
                    </Button>
                  </Link>
                )}
                {equiposPendientes.length > 0 && (
                  <Link href={`/${ligaSeleccionada.slug}/aprobaciones`}>
                    <Button variant="secondary" className="w-full justify-start">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {equiposPendientes.length} Pendientes
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
                <Link href={`/${ligaSeleccionada.slug}/calendario`}>
                  <Button className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Calendario
                  </Button>
                </Link>
                {permisos?.puede_crear_partidos && (
                  <Link href={`/admin/programacion-partidos?liga=${ligaSeleccionada.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Partido
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
                <Link href={`/${ligaSeleccionada.slug}/canchas`}>
                  <Button className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Ver Canchas ({estadisticas?.canchas_disponibles || 0})
                  </Button>
                </Link>
                {permisos?.puede_crear_canchas && (
                  <Link href={`/admin/canchas/nueva?liga=${ligaSeleccionada.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Cancha
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
                      <Link href={`/${ligaSeleccionada.slug}/equipos/${equipo.id}`}>
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
