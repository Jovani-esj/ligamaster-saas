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
  Trophy,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Partido {
  id: string;
  liga_id: string;
  equipo_local_id: string;
  equipo_visitante_id: string;
  cancha_id: string;
  fecha_hora: string;
  duracion_minutos: number;
  estado: string;
  goles_local: number;
  goles_visitante: number;
  jornada: number;
  observaciones?: string;
  equipo_local?: {
    id: string;
    nombre: string;
  };
  equipo_visitante?: {
    id: string;
    nombre: string;
  };
  cancha?: {
    id: string;
    nombre: string;
  };
  liga?: {
    id: string;
    nombre_liga: string;
    slug: string;
  };
}

export default function CalendarioPage() {
  const [loading, setLoading] = useState(true);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [ligas, setLigas] = useState<any[]>([]);
  const [ligaSeleccionada, setLigaSeleccionada] = useState<string>('');
  const [mesActual, setMesActual] = useState(new Date());
  const [vista, setVista] = useState<'mes' | 'lista'>('mes');

  useEffect(() => {
    cargarLigas();
  }, []);

  useEffect(() => {
    if (ligas.length > 0) {
      if (!ligaSeleccionada && ligas[0]) {
        setLigaSeleccionada(ligas[0].id);
      }
    }
  }, [ligas]);

  useEffect(() => {
    if (ligaSeleccionada) {
      cargarPartidos();
    }
  }, [ligaSeleccionada, mesActual]);

  const cargarLigas = async () => {
    try {
      const { data, error } = await supabase
        .from('ligas')
        .select('id, nombre_liga, slug, activa, estatus_pago')
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
    if (!ligaSeleccionada) return;

    setLoading(true);
    try {
      let query = supabase
        .from('partidos')
        .select(`
          *,
          equipo_local:equipos!partidos_equipo_local_id_fkey(nombre),
          equipo_visitante:equipos!partidos_equipo_visitante_id_fkey(nombre),
          cancha:canchas(nombre),
          liga:ligas!partidos_liga_id_fkey(nombre_liga, slug)
        `)
        .eq('liga_id', ligaSeleccionada)
        .order('fecha_hora', { ascending: true });

      // Si estamos en vista de mes, filtrar por mes
      if (vista === 'mes') {
        const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
        const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
        
        query = query
          .gte('fecha_hora', primerDia.toISOString())
          .lte('fecha_hora', ultimoDia.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setPartidos(data || []);
    } catch (error) {
      console.error('Error cargando partidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarMes = (direccion: number) => {
    const nuevoMes = new Date(mesActual);
    nuevoMes.setMonth(nuevoMes.getMonth() + direccion);
    setMesActual(nuevoMes);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerResultado = (partido: Partido) => {
    if (partido.estado === 'finalizado') {
      return `${partido.goles_local} - ${partido.goles_visitante}`;
    } else if (partido.estado === 'en_juego') {
      return 'En juego';
    } else {
      return 'vs';
    }
  };

  const agruparPorDia = (partidos: Partido[]) => {
    const agrupados: Record<string, Partido[]> = {};
    
    partidos.forEach(partido => {
      const fecha = new Date(partido.fecha_hora).toLocaleDateString('es-MX');
      if (!agrupados[fecha]) {
        agrupados[fecha] = [];
      }
      agrupados[fecha].push(partido);
    });
    
    return agrupados;
  };

  const partidosPorDia = agruparPorDia(partidos);

  if (loading && partidos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-blue-600" />
            Calendario de Partidos
          </h1>
          <p className="text-gray-600">
            Consulta los próximos partidos de todas las ligas activas
          </p>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div>
                <Label htmlFor="liga">Liga:</Label>
                <select
                  id="liga"
                  value={ligaSeleccionada}
                  onChange={(e) => setLigaSeleccionada(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las ligas</option>
                  {ligas.map((liga) => (
                    <option key={liga.id} value={liga.id}>
                      {liga.nombre_liga}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVista(vista === 'mes' ? 'lista' : 'mes')}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  {vista === 'mes' ? 'Vista Lista' : 'Vista Mes'}
                </Button>
              </div>
            </div>

            {vista === 'mes' && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarMes(-1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium text-gray-900 min-w-[150px] text-center">
                  {mesActual.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarMes(1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="space-y-6">
          {partidos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay partidos programados
                </h3>
                <p className="text-gray-500">
                  {vista === 'mes' 
                    ? 'No hay partidos programados para este mes'
                    : 'No hay partidos programados para esta liga'
                  }
                </p>
              </CardContent>
            </Card>
          ) : vista === 'mes' ? (
            // Vista por mes
            Object.entries(partidosPorDia).map(([fecha, partidosDia]) => (
              <Card key={fecha}>
                <CardHeader>
                  <CardTitle className="text-lg">{fecha}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {partidosDia.map((partido) => (
                      <div key={partido.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="text-center">
                              <p className="font-bold text-lg text-gray-900">
                                {obtenerResultado(partido)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatearHora(partido.fecha_hora)}
                              </p>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {partido.equipo_local?.nombre} vs {partido.equipo_visitante?.nombre}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {partido.cancha?.nombre || 'Por definir'}
                                </span>
                                <span className="flex items-center">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  Jornada {partido.jornada}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            partido.estado === 'finalizado' 
                              ? 'bg-green-100 text-green-800'
                              : partido.estado === 'en_juego'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {partido.estado === 'finalizado' ? 'Finalizado' :
                             partido.estado === 'en_juego' ? 'En juego' : 'Programado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Vista lista
            <Card>
              <CardHeader>
                <CardTitle>Próximos Partidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fecha y Hora</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Partido</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cancha</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Jornada</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partidos.map((partido) => (
                        <tr key={partido.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatearFecha(partido.fecha_hora)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatearHora(partido.fecha_hora)}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {partido.equipo_local?.nombre} vs {partido.equipo_visitante?.nombre}
                              </p>
                              {partido.estado === 'finalizado' && (
                                <p className="text-sm text-gray-600">
                                  Resultado: {partido.goles_local} - {partido.goles_visitante}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">
                              {partido.cancha?.nombre || 'Por definir'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">
                              Jornada {partido.jornada}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              partido.estado === 'finalizado' 
                                ? 'bg-green-100 text-green-800'
                                : partido.estado === 'en_juego'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {partido.estado === 'finalizado' ? 'Finalizado' :
                               partido.estado === 'en_juego' ? 'En juego' : 'Programado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
