'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Users, 
  Play,
  Settings,
  Trophy,
  RefreshCw,
  Eye
} from 'lucide-react';

interface Equipo {
  id: string;
  nombre: string;
  liga_id: string;
  activo: boolean;
}

interface Cancha {
  id: string;
  nombre: string;
  liga_id: string;
  activa: boolean;
}

interface ConfiguracionTemporada {
  id: string;
  liga_id: string;
  nombre_temporada: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_juego: string[];
  hora_inicio: string;
  hora_fin: string;
  intervalo_minutos: number;
  formato: string;
  vueltas: number;
  activa: boolean;
}

interface Partido {
  id: string;
  liga_id: string;
  equipo_local_id: string;
  equipo_visitante_id: string;
  cancha_id?: string;
  fecha_jornada: string;
  duracion_minutos: number;
  estado: string;
  jornada: number;
  equipo_local?: Equipo;
  equipo_visitante?: Equipo;
  cancha?: Cancha;
}

export default function ProgramacionPartidos() {
  const { user, profile, isAdminLiga, isAdminAdmin } = useSimpleAuth();
  const [loading, setLoading] = useState(true);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionTemporada | null>(null);
  const [showConfiguracion, setShowConfiguracion] = useState(false);
  const [showPartidos, setShowPartidos] = useState(false);
  const [generandoPartidos, setGenerandoPartidos] = useState(false);

  const [formData, setFormData] = useState({
    nombre_temporada: '',
    fecha_inicio: '',
    fecha_fin: '',
    dias_juego: [] as string[],
    hora_inicio: '19:00',
    hora_fin: '23:00',
    intervalo_minutos: 90,
    formato: 'todos_contra_todos',
    vueltas: 1
  });

  const cargarDatos = useCallback(async () => {
    try {
      const ligaId = profile?.liga_id;
      
      // Cargar equipos
      const { data: equiposData } = await supabase
        .from('equipos')
        .select('*')
        .eq('liga_id', ligaId)
        .eq('activo', true)
        .order('nombre');

      // Cargar canchas
      const { data: canchasData } = await supabase
        .from('canchas')
        .select('*')
        .eq('liga_id', ligaId)
        .eq('activa', true)
        .order('nombre');

      // Cargar configuración activa
      const { data: configData } = await supabase
        .from('configuraciones_temporada')
        .select('*')
        .eq('liga_id', ligaId)
        .eq('activa', true)
        .single();

      // Cargar partidos
      const { data: partidosData } = await supabase
        .from('partidos')
        .select(`
          *,
          equipo_local:equipos!partidos_equipo_local_id_fkey(nombre),
          equipo_visitante:equipos!partidos_equipo_visitante_id_fkey(nombre),
          cancha:canchas(nombre)
        `)
        .eq('liga_id', ligaId)
        .order('fecha_jornada', { ascending: true });

      setEquipos(equiposData || []);
      setCanchas(canchasData || []);
      setConfiguracion(configData);
      setPartidos(partidosData || []);
      
      if (configData) {
        setFormData({
          nombre_temporada: configData.nombre_temporada,
          fecha_inicio: configData.fecha_inicio,
          fecha_fin: configData.fecha_fin,
          dias_juego: configData.dias_juego || [],
          hora_inicio: configData.hora_inicio,
          hora_fin: configData.hora_fin,
          intervalo_minutos: configData.intervalo_minutos,
          formato: configData.formato,
          vueltas: configData.vueltas
        });
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [profile?.liga_id]);

  useEffect(() => {
    if (user && (isAdminLiga || isAdminAdmin)) {
      cargarDatos();
    }
  }, [user, isAdminLiga, isAdminAdmin, cargarDatos]);

  const guardarConfiguracion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_temporada.trim() || !formData.fecha_inicio || !formData.fecha_fin) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    if (formData.dias_juego.length === 0) {
      toast.error('Selecciona al menos un día de juego');
      return;
    }

    setLoading(true);
    try {
      const configData = {
        ...formData,
        liga_id: profile?.liga_id,
        nombre_temporada: formData.nombre_temporada.trim()
      };

      if (configuracion) {
        // Actualizar configuración existente
        const { error } = await supabase
          .from('configuraciones_temporada')
          .update(configData)
          .eq('id', configuracion.id);

        if (error) throw error;
        toast.success('Configuración actualizada');
      } else {
        // Crear nueva configuración
        const { error } = await supabase
          .from('configuraciones_temporada')
          .insert([configData]);

        if (error) throw error;
        toast.success('Configuración creada');
      }

      setShowConfiguracion(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error guardando configuración:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const generarPartidosRoundRobin = async () => {
    if (!configuracion || equipos.length < 2) {
      toast.error('Se necesita una configuración y al menos 2 equipos');
      return;
    }

    setGenerandoPartidos(true);
    try {
      // Implementación del algoritmo Round Robin
      const partidosGenerados = generarCalendarioRoundRobin(equipos, configuracion);
      
      // Insertar partidos en la base de datos
      const { error } = await supabase
        .from('partidos')
        .insert(partidosGenerados);

      if (error) throw error;
      
      toast.success(`Se generaron ${partidosGenerados.length} partidos exitosamente`);
      await cargarDatos();
    } catch (error) {
      console.error('Error generando partidos:', error);
      toast.error('Error al generar los partidos');
    } finally {
      setGenerandoPartidos(false);
    }
  };

  const generarCalendarioRoundRobin = (equipos: Equipo[], config: ConfiguracionTemporada): Partido[] => {
    const partidos: Partido[] = [];
    const { fecha_inicio, fecha_fin, dias_juego, hora_inicio, intervalo_minutos, vueltas } = config;
    
    // Si el número de equipos es impar, agregar un equipo fantasma
    let equiposRotacion = [...equipos];
    if (equiposRotacion.length % 2 !== 0) {
      equiposRotacion.push({ id: 'bye', nombre: 'BYE', liga_id: '', activo: true });
    }

    const numEquipos = equiposRotacion.length;
    const numJornadasPorVuelta = numEquipos - 1;
    
    let jornadaActual = 1;
    const fechaInicial = new Date(fecha_inicio);

    for (let vuelta = 1; vuelta <= vueltas; vuelta++) {
      for (let jornada = 1; jornada <= numJornadasPorVuelta; jornada++) {
        // Generar partidos para esta jornada
        for (let i = 0; i < numEquipos / 2; i++) {
          const equipoLocal = equiposRotacion[i];
          const equipoVisitante = equiposRotacion[numEquipos - 1 - i];
          
          // Saltar partidos contra BYE
          if (equipoLocal.id === 'bye' || equipoVisitante.id === 'bye') {
            continue;
          }

          // En la segunda vuelta, invertir localía
          const local = vuelta === 2 ? equipoVisitante : equipoLocal;
          const visitante = vuelta === 2 ? equipoLocal : equipoVisitante;

          // Encontrar la próxima fecha disponible
          let fechaEncontrada = false;
          const fechaIntento = new Date(fechaInicial);
          
          while (!fechaEncontrada && fechaIntento <= new Date(fecha_fin)) {
            const diaSemana = fechaIntento.getDay();
            const diaNombre = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][diaSemana];
            
            if (dias_juego.includes(diaNombre)) {
              const horaInicio = new Date(fechaIntento);
              const [horas, minutos] = hora_inicio.split(':');
              horaInicio.setHours(parseInt(horas), parseInt(minutos), 0, 0);
              
              partidos.push({
                id: crypto.randomUUID(),
                liga_id: config.liga_id,
                equipo_local_id: local.id,
                equipo_visitante_id: visitante.id,
                fecha_jornada: horaInicio.toISOString(),
                duracion_minutos: intervalo_minutos,
                estado: 'programado',
                jornada: jornadaActual
              } as Partido);
              
              fechaEncontrada = true;
            }
            
            fechaIntento.setDate(fechaIntento.getDate() + 1);
          }
        }
        
        jornadaActual++;
        
        // Rotar equipos (excepto el primero)
        const primerEquipo = equiposRotacion[0];
        const restoEquipos = equiposRotacion.slice(1);
        equiposRotacion = [primerEquipo, ...restoEquipos.slice(1).reverse(), restoEquipos[0]];
        
        // Avanzar a la próxima semana
        fechaInicial.setDate(fechaInicial.getDate() + 7);
      }
    }
    
    return partidos;
  };

  const eliminarPartidos = async () => {
    if (!confirm('¿Estás seguro de eliminar todos los partidos programados?')) return;

    try {
      const { error } = await supabase
        .from('partidos')
        .delete()
        .eq('liga_id', profile?.liga_id)
        .eq('estado', 'programado');

      if (error) throw error;
      
      toast.success('Partidos eliminados exitosamente');
      await cargarDatos();
    } catch (error) {
      console.error('Error eliminando partidos:', error);
      toast.error('Error al eliminar los partidos');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAdminLiga && !isAdminAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600">
              No tienes permisos para programar partidos. Debes ser administrador de liga.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Programación de Partidos</h1>
          <p className="text-gray-600">
            Configura la temporada y genera el calendario de partidos automáticamente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuración y Acciones */}
          <div className="lg:col-span-1 space-y-6">
            {/* Configuración de Temporada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent>
                {configuracion ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Temporada</p>
                      <p className="text-sm text-gray-900">{configuracion.nombre_temporada}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Periodo</p>
                      <p className="text-sm text-gray-900">
                        {new Date(configuracion.fecha_inicio).toLocaleDateString()} - {new Date(configuracion.fecha_fin).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Días de juego</p>
                      <p className="text-sm text-gray-900">{configuracion.dias_juego?.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Horario</p>
                      <p className="text-sm text-gray-900">{configuracion.hora_inicio} - {configuracion.hora_fin}</p>
                    </div>
                    <Button
                      onClick={() => setShowConfiguracion(true)}
                      variant="outline"
                      className="w-full"
                    >
                      Editar Configuración
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-4">No hay configuración activa</p>
                    <Button onClick={() => setShowConfiguracion(true)} className="w-full">
                      Crear Configuración
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Equipos registrados</span>
                    <span className="text-sm font-medium">{equipos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Canchas disponibles</span>
                    <span className="text-sm font-medium">{canchas.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Partidos programados</span>
                    <span className="text-sm font-medium">{partidos.filter(p => p.estado === 'programado').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Partidos jugados</span>
                    <span className="text-sm font-medium">{partidos.filter(p => p.estado === 'finalizado').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={generarPartidosRoundRobin}
                  disabled={!configuracion || equipos.length < 2 || generandoPartidos}
                  className="w-full"
                >
                  {generandoPartidos ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Generar Partidos
                </Button>
                
                <Button
                  onClick={() => setShowPartidos(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Partidos
                </Button>
                
                {partidos.length > 0 && (
                  <Button
                    onClick={eliminarPartidos}
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700"
                  >
                    Eliminar Partidos
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Vista Previa de Equipos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Equipos Participantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {equipos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay equipos registrados en esta liga
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {equipos.map((equipo) => (
                      <div key={equipo.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{equipo.nombre}</p>
                          <p className="text-sm text-gray-500">Activo</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal Configuración */}
        {showConfiguracion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {configuracion ? 'Editar Configuración' : 'Nueva Configuración'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={guardarConfiguracion} className="space-y-4">
                  <div>
                    <Label htmlFor="nombre_temporada">Nombre de la Temporada *</Label>
                    <Input
                      id="nombre_temporada"
                      value={formData.nombre_temporada}
                      onChange={(e) => setFormData({...formData, nombre_temporada: e.target.value})}
                      placeholder="Ej: Temporada 2024"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
                      <Input
                        id="fecha_inicio"
                        type="date"
                        value={formData.fecha_inicio}
                        onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="fecha_fin">Fecha de Fin *</Label>
                      <Input
                        id="fecha_fin"
                        type="date"
                        value={formData.fecha_fin}
                        onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Días de Juego *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map((dia) => (
                        <label key={dia} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.dias_juego.includes(dia)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, dias_juego: [...formData.dias_juego, dia]});
                              } else {
                                setFormData({...formData, dias_juego: formData.dias_juego.filter(d => d !== dia)});
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm capitalize">{dia}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hora_inicio">Hora de Inicio</Label>
                      <Input
                        id="hora_inicio"
                        type="time"
                        value={formData.hora_inicio}
                        onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hora_fin">Hora de Fin</Label>
                      <Input
                        id="hora_fin"
                        type="time"
                        value={formData.hora_fin}
                        onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="intervalo">Intervalo (minutos)</Label>
                      <Input
                        id="intervalo"
                        type="number"
                        value={formData.intervalo_minutos}
                        onChange={(e) => setFormData({...formData, intervalo_minutos: parseInt(e.target.value) || 90})}
                        min="30"
                        max="240"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vueltas">Vueltas</Label>
                      <select
                        id="vueltas"
                        value={formData.vueltas}
                        onChange={(e) => setFormData({...formData, vueltas: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>Una vuelta (ida)</option>
                        <option value={2}>Dos vueltas (ida y vuelta)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button type="submit" className="flex-1">
                      {configuracion ? 'Actualizar' : 'Crear'} Configuración
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowConfiguracion(false)}
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

        {/* Modal Partidos */}
        {showPartidos && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Partidos Programados</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setShowPartidos(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partidos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No hay partidos programados
                    </p>
                  ) : (
                    partidos.map((partido) => (
                      <div key={partido.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="font-medium">{partido.equipo_local?.nombre}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">VS</p>
                            <p className="text-sm text-gray-500">
                              {new Date(partido.fecha_jornada).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(partido.fecha_jornada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{partido.equipo_visitante?.nombre}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            partido.estado === 'programado' ? 'bg-blue-100 text-blue-800' :
                            partido.estado === 'finalizado' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {partido.estado}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
