'use client';

import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Settings, Users, Trophy, Play, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function GeneradorCalendarioPage() {
  const { profile } = useSimpleAuth();
  const [ligas, setLigas] = useState<any[]>([]);
  const [ligaSeleccionada, setLigaSeleccionada] = useState<string>('');
  const [equipos, setEquipos] = useState<any[]>([]);
  const [canchas, setCanchas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState<string>('');
  
  // Parámetros de generación
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [horaInicio, setHoraInicio] = useState<string>('08:00');
  const [duracionPartido, setDuracionPartido] = useState<number>(60);
  const [diasJuego, setDiasJuego] = useState<number[]>([6]); // Sábado por defecto

  const diasSemana = [
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' },
    { id: 0, nombre: 'Domingo' }
  ];

  const isRestricted = !profile || (profile.rol !== 'admin_liga' && profile.rol !== 'superadmin');

  useEffect(() => {
    if (!isRestricted) {
      cargarLigas();
    } else {
      setLoading(false);
    }
  }, [isRestricted, profile?.id]);

  useEffect(() => {
    if (ligaSeleccionada) {
      cargarDatosLiga(ligaSeleccionada);
    } else {
      setEquipos([]);
      setCanchas([]);
    }
  }, [ligaSeleccionada]);

  const cargarLigas = async () => {
    try {
      const query = supabase.from('ligas').select('id, nombre_liga, activa');
      
      if (profile?.rol === 'admin_liga') {
        query.eq('owner_id', profile.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      setLigas(data || []);
      if (data && data.length > 0) {
        setLigaSeleccionada(data[0].id);
      }
    } catch (error) {
      console.error('Error cargando ligas:', error);
      toast.error('Error al cargar las ligas');
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosLiga = async (ligaId: string) => {
    try {
      // Cargar equipos
      const { data: dataEquipos, error: errEquipos } = await supabase
        .from('equipos')
        .select('id, nombre')
        .eq('liga_id', ligaId);
        
      if (errEquipos) throw errEquipos;
      setEquipos(dataEquipos || []);

      // Cargar canchas (ahora soportando multi-liga via liga_canchas)
      const { data: dataCanchas, error: errCanchas } = await supabase
        .from('canchas')
        .select('id, nombre, liga_canchas!inner(liga_id)')
        .eq('liga_canchas.liga_id', ligaId);
        
      if (!errCanchas && dataCanchas) {
        setCanchas(dataCanchas);
        if (dataCanchas.length > 0) setCanchaSeleccionada(dataCanchas[0].id);
      } else {
        // Fallback si no está migrada la base de datos
        const { data: fallback } = await supabase.from('canchas').select('id, nombre').eq('liga_id', ligaId);
        setCanchas(fallback || []);
        if (fallback && fallback.length > 0) setCanchaSeleccionada(fallback[0].id);
      }
      
    } catch (error) {
      console.error('Error cargando datos de liga:', error);
    }
  };

  const toggleDiaJuego = (diaId: number) => {
    setDiasJuego(prev => 
      prev.includes(diaId) 
        ? prev.filter(d => d !== diaId) 
        : [...prev, diaId]
    );
  };

  // Algoritmo Round-Robin para generar enfrentamientos
  const generarRoundRobin = (equipos: any[]) => {
    let teams = [...equipos];
    if (teams.length % 2 !== 0) {
      teams.push({ id: 'descanso', nombre: 'Descanso' }); // Bye
    }

    const numJornadas = teams.length - 1;
    const partidosPorJornada = teams.length / 2;
    const jornadas = [];

    for (let j = 0; j < numJornadas; j++) {
      const partidosJornada = [];
      for (let p = 0; p < partidosPorJornada; p++) {
        const local = teams[p];
        const visitante = teams[teams.length - 1 - p];
        
        // Evitar registrar partidos donde uno descansa
        if (local.id !== 'descanso' && visitante.id !== 'descanso') {
          partidosJornada.push({
            equipo_local_id: local.id,
            equipo_visitante_id: visitante.id,
            jornada: j + 1
          });
        }
      }
      jornadas.push(partidosJornada);
      
      // Rotar equipos (el primero se queda fijo)
      const primerEquipo = teams.shift()!;
      const ultimoEquipo = teams.pop()!;
      teams.unshift(ultimoEquipo);
      teams.unshift(primerEquipo);
    }

    return jornadas;
  };

  const obtenerSiguienteDiaJuego = (fechaActual: Date, diasPermitidos: number[]) => {
    let nuevaFecha = new Date(fechaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + 1); // Avanzar un día
    
    // Buscar el próximo día que coincida con los días permitidos
    while (!diasPermitidos.includes(nuevaFecha.getDay())) {
      nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    }
    return nuevaFecha;
  };

  const handleGenerarCalendario = async () => {
    if (!ligaSeleccionada) return toast.error('Selecciona una liga');
    if (equipos.length < 2) return toast.error('Se necesitan al menos 2 equipos en la liga');
    if (!fechaInicio) return toast.error('Selecciona una fecha de inicio');
    if (diasJuego.length === 0) return toast.error('Selecciona al menos un día de juego');
    
    // Como torneo_id no existe obligatoriamente o es desconocido aquí, 
    // pero si es obligatorio en la DB, veremos cómo se comporta.
    setGenerando(true);
    try {
      // Obtener o crear un torneo para esta liga
      let torneoId = '';
      const { data: torneos } = await supabase
        .from('torneos')
        .select('id')
        .eq('liga_id', ligaSeleccionada)
        .eq('activo', true)
        .limit(1);

      if (torneos && torneos.length > 0) {
        torneoId = torneos[0].id;
      } else {
        const { data: nuevoTorneo, error: errTorneo } = await supabase
          .from('torneos')
          .insert([{ liga_id: ligaSeleccionada, nombre: 'Torneo Principal', activo: true }])
          .select()
          .single();
        if (errTorneo) throw errTorneo;
        torneoId = nuevoTorneo.id;
      }

      // 1. Generar los cruces base (Round Robin)
      const fixture = generarRoundRobin(equipos);
      
      // 2. Asignar fechas y horarios
      const partidosAInsertar: any[] = [];
      let fechaActual = new Date(`${fechaInicio}T${horaInicio}:00`);
      
      // Ajustar la fecha inicial al primer día de juego permitido si no lo es
      if (!diasJuego.includes(fechaActual.getDay())) {
        fechaActual = obtenerSiguienteDiaJuego(fechaActual, diasJuego);
      }

      fixture.forEach((jornadaMatches) => {
        // Al inicio de cada jornada, reseteamos la hora
        let horaPartidoActual = new Date(fechaActual);
        horaPartidoActual.setHours(parseInt(horaInicio.split(':')[0]), parseInt(horaInicio.split(':')[1]), 0);

        jornadaMatches.forEach((match) => {
          partidosAInsertar.push({
            liga_id: ligaSeleccionada,
            torneo_id: torneoId, 
            equipo_local_id: match.equipo_local_id,
            equipo_visitante_id: match.equipo_visitante_id,
            cancha_id: (canchaSeleccionada && canchaSeleccionada !== 'none') ? canchaSeleccionada : null,
            jornada: match.jornada,
            fecha_jornada: horaPartidoActual.toISOString(),
            duracion_minutos: duracionPartido,
            estado: 'programado',
            marcador_local: 0,
            marcador_visitante: 0
          });

          // Incrementar horario para el siguiente partido de la misma jornada
          horaPartidoActual.setMinutes(horaPartidoActual.getMinutes() + duracionPartido);
        });

        // Al finalizar la jornada, avanzamos a la siguiente fecha disponible
        fechaActual = obtenerSiguienteDiaJuego(fechaActual, diasJuego);
      });

      // 3. Insertar en la base de datos
      const { error } = await supabase.from('partidos').insert(partidosAInsertar);
      if (error) throw error;

      toast.success(`¡Calendario generado exitosamente! Se programaron ${partidosAInsertar.length} partidos.`);
      
    } catch (error) {
      console.error('Error generando calendario:', error);
      toast.error('Error al generar el calendario. Revisa la consola.');
    } finally {
      setGenerando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isRestricted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
          <p className="text-gray-600">Solo administradores de liga pueden programar calendarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            Programación Automática
          </h1>
          <p className="text-gray-600 mt-2">
            Genera un fixture completo (Round-Robin) para todos los equipos de tu liga en un solo clic, evitando colisiones.
          </p>
        </div>

        {ligas.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No tienes ligas activas</h2>
              <p className="text-gray-600">Crea una liga primero para poder programar partidos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Panel Izquierdo: Estado de Liga */}
            <Card className="md:col-span-1 border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">Estado Actual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Liga Seleccionada</Label>
                  <Select value={ligaSeleccionada} onValueChange={setLigaSeleccionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ligas.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.nombre_liga}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{equipos.length}</p>
                    <p className="text-sm text-blue-700">Equipos Inscritos</p>
                  </div>
                </div>

                {equipos.length < 2 && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Requiere mínimo 2 equipos
                  </p>
                )}
                
                {equipos.length % 2 !== 0 && equipos.length > 1 && (
                  <p className="text-sm text-yellow-600 flex items-center gap-1 bg-yellow-50 p-2 rounded">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Número impar: un equipo descansará cada jornada.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Panel Derecho: Parámetros del Generador */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  Reglas del Fixture
                </CardTitle>
                <CardDescription>
                  El sistema cruzará a todos contra todos creando las jornadas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha de Inicio (Jornada 1)</Label>
                    <Input 
                      type="date" 
                      value={fechaInicio} 
                      onChange={(e) => setFechaInicio(e.target.value)} 
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora del primer partido</Label>
                    <Input 
                      type="time" 
                      value={horaInicio} 
                      onChange={(e) => setHoraInicio(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Días de Juego Permitidos</Label>
                  <div className="flex flex-wrap gap-2">
                    {diasSemana.map(dia => (
                      <BadgeCheck 
                        key={dia.id} 
                        label={dia.nombre} 
                        active={diasJuego.includes(dia.id)} 
                        onClick={() => toggleDiaJuego(dia.id)} 
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duración por partido (minutos)</Label>
                    <Input 
                      type="number" 
                      value={duracionPartido} 
                      onChange={(e) => setDuracionPartido(parseInt(e.target.value))} 
                      min="30" max="120" step="5"
                    />
                    <p className="text-xs text-gray-500">Incluye tiempo de descanso entre partidos</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cancha Principal</Label>
                    <Select value={canchaSeleccionada} onValueChange={setCanchaSeleccionada}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cancha..." />
                      </SelectTrigger>
                      <SelectContent>
                        {canchas.length === 0 ? (
                          <SelectItem value="none" disabled>Sin canchas registradas</SelectItem>
                        ) : (
                          canchas.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button 
                    onClick={handleGenerarCalendario} 
                    disabled={generando || equipos.length < 2 || !fechaInicio || diasJuego.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 font-semibold w-full sm:w-auto"
                  >
                    {generando ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generando...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Play className="w-4 h-4 fill-current" /> Generar Temporada</span>
                    )}
                  </Button>
                </div>

              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}

function BadgeCheck({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
        active 
          ? 'bg-blue-100 border-blue-500 text-blue-700' 
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {active && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
      {label}
    </button>
  );
}
