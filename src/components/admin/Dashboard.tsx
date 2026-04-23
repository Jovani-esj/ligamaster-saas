'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Liga, 
  Equipo, 
  Jugador, 
  Torneo, 
  Partido, 
  Cancha,
  UserProfile,
  EstadisticasLiga,
  EstadisticasEquipo,
  PERMISOS_POR_ROL 
} from '@/types/database';
import { 
  getLigas, 
  getEquipos,
  getJugadores,
  getTorneos,
  getPartidosPorLiga,
  getCanchas,
  getEstadisticasLiga,
  getEstadisticasEquipo
} from '@/lib/database';
import { useAuth } from '@/components/auth/AuthenticationSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Trophy, 
  Calendar, 
  MapPin, 
  Settings, 
  Plus, 
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [estadisticasLiga, setEstadisticasLiga] = useState<Record<string, EstadisticasLiga>>({});
  const [estadisticasEquipo, setEstadisticasEquipo] = useState<Record<string, EstadisticasEquipo>>({});

  // Verificar permisos
  const permisos = profile ? PERMISOS_POR_ROL[profile.rol] : null;

  useEffect(() => {
    fetchDashboardData();
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      const promises: Promise<any>[] = [];

      // Según el rol, obtener diferentes datos
      if (profile.rol === 'superadmin' || profile.rol === 'adminadmin') {
        // SuperAdmin y AdminAdmin ven todo
        promises.push(getLigas());
        promises.push(getEquipos('').catch(() => [])); // Todos los equipos
        promises.push(getJugadores('').catch(() => [])); // Todos los jugadores
        promises.push(getTorneos('').catch(() => [])); // Todos los torneos
        promises.push(getPartidosPorLiga('').catch(() => [])); // Todos los partidos
        promises.push(getCanchas('').catch(() => [])); // Todas las canchas
      } else if (profile.rol === 'admin_liga' && profile.liga_id) {
        // Admin de liga solo ve su liga
        promises.push(getLigas(profile.user_id));
        promises.push(getEquipos(profile.liga_id));
        promises.push(getTorneos(profile.liga_id));
        promises.push(getPartidosPorLiga(profile.liga_id));
        promises.push(getCanchas(profile.liga_id));
        
        // Obtener jugadores de los equipos de la liga
        const equiposData = await getEquipos(profile.liga_id);
        const jugadoresPromises = equiposData.map(equipo => getJugadores(equipo.id));
        const jugadoresArrays = await Promise.all(jugadoresPromises);
        const todosJugadores = jugadoresArrays.flat();
        setJugadores(todosJugadores);
      } else if (profile.rol === 'capitan_equipo' && profile.equipo_id) {
        // Capitán solo ve su equipo
        promises.push(getJugadores(profile.equipo_id));
        promises.push(getEquipos(profile.liga_id || ''));
        
        // Obtener partidos de su equipo
        const partidosData = await getPartidosPorLiga(profile.liga_id || '');
        const partidosEquipo = partidosData.filter(p => 
          p.equipo_local_id === profile.equipo_id || 
          p.equipo_visitante_id === profile.equipo_id
        );
        setPartidos(partidosEquipo);
      } else if (profile.rol === 'usuario' && profile.equipo_id) {
        // Usuario normal ve su equipo y jugadores
        promises.push(getJugadores(profile.equipo_id));
        promises.push(getEquipos(profile.liga_id || ''));
      }

      const results = await Promise.all(promises);

      // Asignar resultados según el rol
      if (profile.rol === 'superadmin' || profile.rol === 'adminadmin') {
        setLigas(results[0] || []);
        setEquipos(results[1] || []);
        setJugadores(results[2] || []);
        setTorneos(results[3] || []);
        setPartidos(results[4] || []);
        setCanchas(results[5] || []);
      } else if (profile.rol === 'admin_liga') {
        setLigas(results[0] || []);
        setEquipos(results[1] || []);
        setTorneos(results[2] || []);
        setPartidos(results[3] || []);
        setCanchas(results[4] || []);
      } else if (profile.rol === 'capitan_equipo') {
        setJugadores(results[0] || []);
        setEquipos(results[1] || []);
      } else if (profile.rol === 'usuario') {
        setJugadores(results[0] || []);
        setEquipos(results[1] || []);
      }

      // Obtener estadísticas
      if (profile.rol === 'admin_liga' && profile.liga_id) {
        const statsLiga = await getEstadisticasLiga(profile.liga_id);
        setEstadisticasLiga({ [profile.liga_id]: statsLiga });
      }

      if ((profile.rol === 'capitan_equipo' || profile.rol === 'usuario') && profile.equipo_id) {
        const statsEquipo = await getEstadisticasEquipo(profile.equipo_id);
        setEstadisticasEquipo({ [profile.equipo_id]: statsEquipo });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getRolDisplay = (rol: string) => {
    switch (rol) {
      case 'superadmin': return 'Super Administrador';
      case 'adminadmin': return 'Administrador del Sistema';
      case 'admin_liga': return 'Administrador de Liga';
      case 'capitan_equipo': return 'Capitán de Equipo';
      case 'usuario': return 'Jugador';
      default: return rol;
    }
  };

  const getPartidosStats = () => {
    const total = partidos.length;
    const jugados = partidos.filter(p => p.estado === 'jugado').length;
    const programados = partidos.filter(p => p.estado === 'programado').length;
    const cancelados = partidos.filter(p => p.estado === 'cancelado').length;
    return { total, jugados, programados, cancelados };
  };

  const getProximosPartidos = () => {
    return partidos
      .filter(p => p.estado === 'programado' && p.fecha_jornada)
      .sort((a, b) => new Date(a.fecha_jornada!).getTime() - new Date(b.fecha_jornada!).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const partidosStats = getPartidosStats();
  const proximosPartidos = getProximosPartidos();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido, {profile?.nombre} {profile?.apellido}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline">{getRolDisplay(profile?.rol || '')}</Badge>
            {profile?.liga_id && ligas.length > 0 && (
              <Badge>Liga: {ligas.find(l => l.id === profile.liga_id)?.nombre_liga}</Badge>
            )}
            {profile?.equipo_id && equipos.length > 0 && (
              <Badge variant="secondary">Equipo: {equipos.find(e => e.id === profile.equipo_id)?.nombre}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(permisos?.puede_ver_ligas || profile?.rol === 'superadmin' || profile?.rol === 'adminadmin') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ligas</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ligas.length}</div>
              <p className="text-xs text-muted-foreground">
                {ligas.filter(l => l.activa).length} activas
              </p>
            </CardContent>
          </Card>
        )}

        {(permisos?.puede_ver_equipos || profile?.rol !== 'superadmin') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipos.length}</div>
              <p className="text-xs text-muted-foreground">
                {equipos.filter(e => e.activo).length} activos
              </p>
            </CardContent>
          </Card>
        )}

        {(permisos?.puede_ver_jugadores || profile?.rol !== 'superadmin') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jugadores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jugadores.length}</div>
              <p className="text-xs text-muted-foreground">
                {jugadores.filter(j => j.activo).length} activos
              </p>
            </CardContent>
          </Card>
        )}

        {(permisos?.puede_ver_partidos || profile?.rol === 'capitan_equipo' || profile?.rol === 'usuario') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partidos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partidosStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {partidosStats.jugados} jugados, {partidosStats.programados} programados
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          {(permisos?.puede_ver_partidos || profile?.rol === 'capitan_equipo' || profile?.rol === 'usuario') && (
            <TabsTrigger value="partidos">Partidos</TabsTrigger>
          )}
          {(permisos?.puede_ver_equipos || profile?.rol !== 'superadmin') && (
            <TabsTrigger value="equipos">Equipos</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Estadísticas de Liga */}
            {profile?.liga_id && estadisticasLiga[profile.liga_id] && (
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas de la Liga</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Equipos:</span>
                    <span className="font-semibold">{estadisticasLiga[profile.liga_id].total_equipos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jugadores:</span>
                    <span className="font-semibold">{estadisticasLiga[profile.liga_id].total_jugadores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partidos Totales:</span>
                    <span className="font-semibold">{estadisticasLiga[profile.liga_id].total_partidos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partidos Jugados:</span>
                    <span className="font-semibold text-green-600">{estadisticasLiga[profile.liga_id].partidos_jugados}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estadísticas de Equipo */}
            {profile?.equipo_id && estadisticasEquipo[profile.equipo_id] && (
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas del Equipo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Jugadores:</span>
                    <span className="font-semibold">{estadisticasEquipo[profile.equipo_id].total_jugadores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partidos Jugados:</span>
                    <span className="font-semibold">{estadisticasEquipo[profile.equipo_id].partidos_jugados}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ganados:</span>
                    <span className="font-semibold text-green-600">{estadisticasEquipo[profile.equipo_id].partidos_ganados}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Puntos:</span>
                    <span className="font-bold">{estadisticasEquipo[profile.equipo_id].puntos}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Próximos Partidos */}
          {proximosPartidos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Próximos Partidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proximosPartidos.map((partido) => (
                    <div key={partido.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">
                            {equipos.find(e => e.id === partido.equipo_local_id)?.nombre || 'TBD'} vs 
                            {' '}
                            {equipos.find(e => e.id === partido.equipo_visitante_id)?.nombre || 'TBD'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {partido.fecha_jornada ? new Date(partido.fecha_jornada).toLocaleString() : 'Por programar'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{partido.estado}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="partidos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Partidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{partidosStats.total}</div>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{partidosStats.jugados}</div>
                  <p className="text-sm text-gray-600">Jugados</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{partidosStats.programados}</div>
                  <p className="text-sm text-gray-600">Programados</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{partidosStats.cancelados}</div>
                  <p className="text-sm text-gray-600">Cancelados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {equipos.slice(0, 6).map((equipo) => (
              <Card key={equipo.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{equipo.nombre}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Estado:</span>
                      <Badge className={equipo.activo ? 'bg-green-500' : 'bg-red-500'}>
                        {equipo.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Jugadores:</span>
                      <span>{jugadores.filter(j => j.equipo_id === equipo.id).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
