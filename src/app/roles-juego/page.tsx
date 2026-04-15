'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search,
  Trophy,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  descripcion: string;
  activa: boolean;
  estatus_pago: boolean;
}

interface Equipo {
  id: string;
  nombre: string;
  liga_id: string;
  activo: boolean;
}

interface Cancha {
  id: string;
  nombre: string;
  direccion?: string;
  tipo: string;
  superficie: string;
}

interface Partido {
  id: string;
  liga_id: string;
  equipo_local_id: string;
  equipo_visitante_id: string;
  cancha_id?: string;
  fecha_hora: string;
  duracion_minutos: number;
  estado: string;
  jornada: number;
  equipo_local?: Equipo;
  equipo_visitante?: Equipo;
  cancha?: Cancha;
  liga?: Liga;
}

export default function RolesJuegoPublicos() {
  const [loading, setLoading] = useState(true);
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [ligaSeleccionada, setLigaSeleccionada] = useState<string>('');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [partidosPorPagina] = useState(10);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [vistaCalendario, setVistaCalendario] = useState(false);

  useEffect(() => {
    cargarLigas();
    cargarPartidos();
  }, []);

  const cargarLigas = async () => {
    try {
      const { data, error } = await supabase
        .from('ligas')
        .select('*')
        .eq('activa', true)
        .eq('estatus_pago', true)
        .order('nombre_liga');

      if (error) throw error;
      setLigas(data || []);
    } catch (error) {
      console.error('Error cargando ligas:', error);
    }
  };

  const cargarPartidos = async () => {
    try {
      const { data, error } = await supabase
        .from('partidos')
        .select(`
          *,
          equipo_local:equipos!partidos_equipo_local_id_fkey(nombre, liga_id),
          equipo_visitante:equipos!partidos_equipo_visitante_id_fkey(nombre, liga_id),
          cancha:canchas(nombre, direccion, tipo, superficie),
          liga:ligas!partidos_liga_id_fkey(nombre_liga, slug, activa, estatus_pago)
        `)
        .in('estado', ['programado', 'en_juego', 'finalizado'])
        .order('fecha_hora', { ascending: true });

      if (error) throw error;
      
      // Filtrar solo partidos de ligas activas y con pago al día
      const partidosFiltrados = (data || []).filter(partido => 
        partido.liga?.activa && partido.liga?.estatus_pago
      );
      
      setPartidos(partidosFiltrados);
    } catch (error) {
      console.error('Error cargando partidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const partidosFiltrados = partidos.filter(partido => {
    const coincideLiga = !ligaSeleccionada || partido.liga_id === ligaSeleccionada;
    const coincideBusqueda = !terminoBusqueda || 
      partido.equipo_local?.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      partido.equipo_visitante?.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      partido.liga?.nombre_liga.toLowerCase().includes(terminoBusqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'todos' || partido.estado === filtroEstado;
    
    return coincideLiga && coincideBusqueda && coincideEstado;
  });

  const totalPaginas = Math.ceil(partidosFiltrados.length / partidosPorPagina);
  const indiceInicio = (paginaActual - 1) * partidosPorPagina;
  const partidosPagina = partidosFiltrados.slice(indiceInicio, indiceInicio + partidosPorPagina);

  const partidosPorFecha = partidosPagina.reduce((acc, partido) => {
    const fecha = new Date(partido.fecha_hora).toLocaleDateString();
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(partido);
    return acc;
  }, {} as Record<string, Partido[]>);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programado':
        return 'bg-blue-100 text-blue-800';
      case 'en_juego':
        return 'bg-yellow-100 text-yellow-800';
      case 'finalizado':
        return 'bg-green-100 text-green-800';
      case 'suspendido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'programado':
        return 'Programado';
      case 'en_juego':
        return 'En Juego';
      case 'finalizado':
        return 'Finalizado';
      case 'suspendido':
        return 'Suspendido';
      default:
        return estado;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando partidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Roles de Juego</h1>
          <p className="text-gray-600 text-lg">
            Consulta los partidos programados de todas las ligas activas
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="liga">Liga</Label>
                <select
                  id="liga"
                  value={ligaSeleccionada}
                  onChange={(e) => {
                    setLigaSeleccionada(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las ligas</option>
                  {ligas.map((liga) => (
                    <option key={liga.id} value={liga.id}>
                      {liga.nombre_liga}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="busqueda">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="busqueda"
                    type="text"
                    placeholder="Equipos o liga..."
                    value={terminoBusqueda}
                    onChange={(e) => {
                      setTerminoBusqueda(e.target.value);
                      setPaginaActual(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  value={filtroEstado}
                  onChange={(e) => {
                    setFiltroEstado(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="programado">Programados</option>
                  <option value="en_juego">En Juego</option>
                  <option value="finalizado">Finalizados</option>
                  <option value="suspendido">Suspendidos</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => setVistaCalendario(!vistaCalendario)}
                  variant="outline"
                  className="w-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {vistaCalendario ? 'Vista Lista' : 'Vista Calendario'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Ligas Activas</p>
                  <p className="text-2xl font-bold">{ligas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Partidos</p>
                  <p className="text-2xl font-bold">{partidosFiltrados.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Programados</p>
                  <p className="text-2xl font-bold">
                    {partidosFiltrados.filter(p => p.estado === 'programado').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Finalizados</p>
                  <p className="text-2xl font-bold">
                    {partidosFiltrados.filter(p => p.estado === 'finalizado').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partidos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Partidos {ligaSeleccionada && `- ${ligas.find(l => l.id === ligaSeleccionada)?.nombre_liga}`}
              </CardTitle>
              <p className="text-sm text-gray-600">
                Mostrando {partidosPagina.length} de {partidosFiltrados.length} partidos
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {partidosPagina.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron partidos
                </h3>
                <p className="text-gray-500">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            ) : vistaCalendario ? (
              // Vista Calendario
              <div className="space-y-6">
                {Object.entries(partidosPorFecha).map(([fecha, partidosDia]) => (
                  <div key={fecha}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 sticky top-0 bg-gray-50 py-2">
                      {fecha}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {partidosDia.map((partido) => (
                        <Card key={partido.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(partido.estado)}`}>
                                {getEstadoTexto(partido.estado)}
                              </span>
                              <span className="text-sm text-gray-500">
                                Jornada {partido.jornada}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-center flex-1">
                                <p className="font-medium text-gray-900">
                                  {partido.equipo_local?.nombre}
                                </p>
                              </div>
                              <div className="text-center px-4">
                                <p className="text-xl font-bold text-gray-400">VS</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(partido.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                              </div>
                              <div className="text-center flex-1">
                                <p className="font-medium text-gray-900">
                                  {partido.equipo_visitante?.nombre}
                                </p>
                              </div>
                            </div>

                            {partido.cancha && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-1" />
                                {partido.cancha.nombre}
                                {partido.cancha.direccion && ` - ${partido.cancha.direccion}`}
                              </div>
                            )}

                            <div className="mt-2 text-xs text-gray-500">
                              Liga: {partido.liga?.nombre_liga}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Vista Lista
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fecha y Hora</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Liga</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Partido</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cancha</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Jornada</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partidosPagina.map((partido) => (
                      <tr key={partido.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              {new Date(partido.fecha_hora).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(partido.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-900">
                            {partido.liga?.nombre_liga}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {partido.equipo_local?.nombre}
                            </span>
                            <span className="text-gray-400">vs</span>
                            <span className="text-sm font-medium text-gray-900">
                              {partido.equipo_visitante?.nombre}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {partido.cancha ? (
                            <div className="text-sm text-gray-600">
                              <p>{partido.cancha.nombre}</p>
                              {partido.cancha.direccion && (
                                <p className="text-xs">{partido.cancha.direccion}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Por definir</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {partido.jornada}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(partido.estado)}`}>
                            {getEstadoTexto(partido.estado)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Página {paginaActual} de {totalPaginas}
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setPaginaActual(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setPaginaActual(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    variant="outline"
                    size="sm"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
