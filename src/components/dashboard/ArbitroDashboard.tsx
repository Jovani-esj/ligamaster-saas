'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Award, 
  ShieldAlert, 
  Trophy, 
  Plus, 
  Trash2,
  FileText,
  Play
} from 'lucide-react';
import { SimpleUser, SimpleProfile } from '@/components/auth/SimpleAuthenticationSystem';

interface ArbitroDashboardProps {
  user: SimpleUser | null;
  profile: SimpleProfile | null;
}

interface Match {
  id: string;
  liga_id: string;
  equipo_local_id: string;
  equipo_visitante_id: string;
  marcador_local: number;
  marcador_visitante: number;
  fecha_jornada: string;
  estado: string;
  cancha_id?: string;
  jornada: number;
  observaciones?: string;
  equipo_local?: { nombre: string };
  equipo_visitante?: { nombre: string };
  cancha?: { nombre: string };
}

interface Player {
  id: string;
  nombre: string;
  apellido?: string;
  equipo_id: string;
  numero_camiseta?: number;
}

interface MatchEvent {
  id: string;
  partido_id: string;
  jugador_id: string;
  equipo_id: string;
  tipo_evento: string;
  minuto: number;
  descripcion?: string;
  jugadores?: { nombre: string; apellido?: string };
}

export default function ArbitroDashboard({ user, profile }: ArbitroDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [assignedMatches, setAssignedMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  // Incidents modal and state
  const [showManageModal, setShowManageModal] = useState(false);
  const [localScore, setLocalScore] = useState(0);
  const [visitorScore, setVisitorScore] = useState(0);
  const [matchStatus, setMatchStatus] = useState('programado');
  const [observations, setObservations] = useState('');
  
  // Players and Events state for current selected match
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [newEvent, setNewEvent] = useState({
    jugador_id: '',
    tipo_evento: 'gol',
    minuto: 1,
    descripcion: ''
  });

  const cargarDatos = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      
      // Cargar partidos asignados a este árbitro
      const { data, error } = await supabase
        .from('partidos')
        .select(`
          *,
          equipo_local:equipos!partidos_equipo_local_id_fkey(nombre),
          equipo_visitante:equipos!partidos_equipo_visitante_id_fkey(nombre),
          cancha:canchas(nombre)
        `)
        .eq('arbitro_id', user.id)
        .order('fecha_jornada', { ascending: true });

      if (error) throw error;
      setAssignedMatches(data || []);
    } catch (error) {
      console.error('Error loading referee matches:', error);
      toast.error('Error al cargar partidos asignados');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      cargarDatos();
    }
  }, [user?.id, cargarDatos]);

  const loadMatchDetails = async (match: Match) => {
    setSelectedMatch(match);
    setLocalScore(match.marcador_local || 0);
    setVisitorScore(match.marcador_visitante || 0);
    setMatchStatus(match.estado || 'programado');
    setObservations(match.observaciones || '');
    setEvents([]);

    try {
      // 1. Cargar jugadores de ambos equipos
      const { data: playersData, error: playersError } = await supabase
        .from('jugadores')
        .select('id, nombre, apellido, equipo_id, numero_camiseta')
        .in('equipo_id', [match.equipo_local_id, match.equipo_visitante_id])
        .eq('activo', true)
        .order('nombre');

      if (playersError) throw playersError;
      setPlayers(playersData || []);

      // 2. Cargar eventos de este partido
      const { data: eventsData, error: eventsError } = await supabase
        .from('eventos_partido')
        .select(`
          *,
          jugadores:jugadores(nombre, apellido)
        `)
        .eq('partido_id', match.id)
        .order('minuto', { ascending: true });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      setShowManageModal(true);
    } catch (err) {
      console.error('Error loading match details:', err);
      toast.error('Error al cargar detalles del partido');
    }
  };

  const saveScoresAndStatus = async () => {
    if (!selectedMatch) return;

    try {
      const { error } = await supabase
        .from('partidos')
        .update({
          marcador_local: localScore,
          marcador_visitante: visitorScore,
          estado: matchStatus,
          observaciones: observations,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedMatch.id);

      if (error) throw error;
      toast.success('Estado del partido y marcador actualizados');
      cargarDatos();
      
      // Update selectedMatch reference
      setSelectedMatch(prev => prev ? {
        ...prev,
        marcador_local: localScore,
        marcador_visitante: visitorScore,
        estado: matchStatus,
        observaciones: observations
      } : null);
    } catch (err) {
      console.error('Error updating match details:', err);
      toast.error('Error al actualizar el marcador');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !newEvent.jugador_id) {
      toast.error('Selecciona un jugador');
      return;
    }

    const selectedPlayer = players.find(p => p.id === newEvent.jugador_id);
    if (!selectedPlayer) return;

    try {
      const { data, error } = await supabase
        .from('eventos_partido')
        .insert([{
          partido_id: selectedMatch.id,
          jugador_id: newEvent.jugador_id,
          equipo_id: selectedPlayer.equipo_id,
          tipo_evento: newEvent.tipo_evento,
          minuto: newEvent.minuto,
          descripcion: newEvent.descripcion || `${newEvent.tipo_evento} registrado`
        }])
        .select(`
          *,
          jugadores:jugadores(nombre, apellido)
        `)
        .single();

      if (error) throw error;
      toast.success('Incidencia registrada');
      setEvents(prev => [...prev, data].sort((a, b) => a.minuto - b.minuto));
      
      // Si el evento fue un gol, podemos actualizar el marcador automáticamente
      if (newEvent.tipo_evento === 'gol') {
        if (selectedPlayer.equipo_id === selectedMatch.equipo_local_id) {
          setLocalScore(prev => prev + 1);
        } else {
          setVisitorScore(prev => prev + 1);
        }
      }

      setNewEvent({
        jugador_id: '',
        tipo_evento: 'gol',
        minuto: 1,
        descripcion: ''
      });
    } catch (err) {
      console.error('Error adding event:', err);
      toast.error('Error al registrar incidencia');
    }
  };

  const handleDeleteEvent = async (eventId: string, isGoal: boolean, playerEquipoId: string) => {
    try {
      const { error } = await supabase
        .from('eventos_partido')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Incidencia eliminada');
      setEvents(prev => prev.filter(e => e.id !== eventId));

      // Revertir gol en el marcador si se eliminó un gol
      if (isGoal && selectedMatch) {
        if (playerEquipoId === selectedMatch.equipo_local_id) {
          setLocalScore(prev => Math.max(0, prev - 1));
        } else {
          setVisitorScore(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Error al eliminar incidencia');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando partidos asignados...</p>
        </div>
      </div>
    );
  }

  const matchesProgramados = assignedMatches.filter(m => m.estado === 'programado' || m.estado === 'en_juego');
  const matchesFinalizados = assignedMatches.filter(m => m.estado === 'finalizado');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Award className="w-8 h-8 mr-3 text-blue-600" />
              Panel del Árbitro
            </h1>
            <p className="text-gray-600 mt-1">
              Bienvenido, {profile?.nombre} {profile?.apellido}. Tienes <span className="font-semibold text-blue-600">{matchesProgramados.length}</span> partidos pendientes por arbitrar.
            </p>
          </div>
          <Badge className="bg-blue-600 text-white text-sm px-3 py-1 self-start md:self-auto">
            Árbitro Oficial
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Partidos Asignados Pendientes */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                  Partidos por Arbitrar ({matchesProgramados.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matchesProgramados.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No tienes partidos programados o asignados actualmente.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matchesProgramados.map((match) => (
                      <div 
                        key={match.id} 
                        className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded">
                              Jornada {match.jornada}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              match.estado === 'en_juego' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {match.estado === 'en_juego' ? 'En Juego' : 'Programado'}
                            </span>
                          </div>
                          
                          <div className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <span>{match.equipo_local?.nombre}</span>
                            <span className="text-gray-400 font-normal">({match.marcador_local})</span>
                            <span className="text-gray-400 font-normal">vs</span>
                            <span>{match.equipo_visitante?.nombre}</span>
                            <span className="text-gray-400 font-normal">({match.marcador_visitante})</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                              {new Date(match.fecha_jornada).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                              {match.cancha?.nombre || 'Por definir'}
                            </div>
                          </div>
                        </div>

                        <Button 
                          onClick={() => loadMatchDetails(match)} 
                          className="bg-blue-600 hover:bg-blue-700 text-white self-end sm:self-auto"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Registrar / Actas
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historial de partidos arbitrados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center text-gray-800">
                  <Trophy className="w-5 h-5 mr-2 text-green-600" />
                  Partidos Finalizados ({matchesFinalizados.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matchesFinalizados.length === 0 ? (
                  <p className="text-center py-6 text-gray-500 text-sm">Aún no has finalizado partidos en esta liga.</p>
                ) : (
                  <div className="divide-y">
                    {matchesFinalizados.map((match) => (
                      <div key={match.id} className="py-3 flex justify-between items-center text-sm">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {match.equipo_local?.nombre} {match.marcador_local} - {match.marcador_visitante} {match.equipo_visitante?.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            Jornada {match.jornada} • {new Date(match.fecha_jornada).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Finalizado
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Reglas o Canchas de la Liga */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Instrucciones de Árbitro
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-3">
                <p>1. <strong>Inicio de juego:</strong> Cambia el estado del partido a &quot;en_juego&quot; para indicar que ha comenzado.</p>
                <p>2. <strong>Reporte en vivo:</strong> Agrega incidencias (goles, tarjetas) a medida que ocurran seleccionando al jugador correspondiente.</p>
                <p>3. <strong>Finalizar:</strong> Al terminar, ingresa el marcador final, redacta observaciones (lesiones, incidentes disciplinarios) y cambia el estado a &quot;finalizado&quot;.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de Registro de Partido */}
        {selectedMatch && (
          <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center justify-between border-b pb-3">
                  <span>Acta de Partido - Jornada {selectedMatch.jornada}</span>
                  <Badge className={matchStatus === 'finalizado' ? 'bg-green-500' : matchStatus === 'en_juego' ? 'bg-red-500' : 'bg-blue-500'}>
                    {matchStatus}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
                {/* Lado Izquierdo: Marcador y Estado */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl border space-y-4">
                    <h3 className="font-bold text-gray-800 text-sm flex items-center">
                      <Trophy className="w-4 h-4 mr-1.5 text-blue-600" />
                      Marcador del Partido
                    </h3>
                    
                    <div className="flex items-center justify-around gap-4 text-center">
                      <div>
                        <Label className="text-xs text-gray-600 block mb-1 truncate max-w-[120px]">{selectedMatch.equipo_local?.nombre}</Label>
                        <Input 
                          type="number" 
                          min="0"
                          value={localScore} 
                          onChange={(e) => setLocalScore(parseInt(e.target.value) || 0)} 
                          className="w-20 text-center text-xl font-bold h-12"
                        />
                      </div>
                      <span className="text-xl font-bold text-gray-400">VS</span>
                      <div>
                        <Label className="text-xs text-gray-600 block mb-1 truncate max-w-[120px]">{selectedMatch.equipo_visitante?.nombre}</Label>
                        <Input 
                          type="number" 
                          min="0"
                          value={visitorScore} 
                          onChange={(e) => setVisitorScore(parseInt(e.target.value) || 0)} 
                          className="w-20 text-center text-xl font-bold h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="match_status">Estado del Partido</Label>
                      <select
                        id="match_status"
                        value={matchStatus}
                        onChange={(e) => setMatchStatus(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="programado">Programado</option>
                        <option value="en_juego">En Juego</option>
                        <option value="finalizado">Finalizado / Terminado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="match_obs">Observaciones / Incidencias Arbitrales</Label>
                      <Textarea
                        id="match_obs"
                        rows={3}
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Detalles sobre faltas, expulsiones o clima..."
                        className="text-xs"
                      />
                    </div>

                    <Button onClick={saveScoresAndStatus} className="w-full bg-blue-600 hover:bg-blue-700">
                      Guardar Marcador y Estado
                    </Button>
                  </div>
                </div>

                {/* Lado Derecho: Eventos del Partido e Incidencias en vivo */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Formulario para agregar evento */}
                  {matchStatus !== 'finalizado' && (
                    <div className="border p-4 rounded-xl space-y-3 bg-white">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center">
                        <Plus className="w-4 h-4 mr-1.5 text-blue-600" />
                        Registrar Incidencia / Evento
                      </h3>
                      <form onSubmit={handleAddEvent} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Label htmlFor="evt_player">Jugador *</Label>
                          <select
                            id="evt_player"
                            value={newEvent.jugador_id}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, jugador_id: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                          >
                            <option value="">Seleccionar jugador...</option>
                            <optgroup label={selectedMatch.equipo_local?.nombre}>
                              {players.filter(p => p.equipo_id === selectedMatch.equipo_local_id).map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.nombre} {p.apellido || ''} {p.numero_camiseta ? `(#${p.numero_camiseta})` : ''}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label={selectedMatch.equipo_visitante?.nombre}>
                              {players.filter(p => p.equipo_id === selectedMatch.equipo_visitante_id).map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.nombre} {p.apellido || ''} {p.numero_camiseta ? `(#${p.numero_camiseta})` : ''}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="evt_type">Tipo de Evento</Label>
                          <select
                            id="evt_type"
                            value={newEvent.tipo_evento}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, tipo_evento: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="gol">Gol</option>
                            <option value="tarjeta_amarilla">Tarjeta Amarilla</option>
                            <option value="tarjeta_roja">Tarjeta Roja</option>
                            <option value="autogol">Autogol</option>
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="evt_min">Minuto</Label>
                          <Input
                            id="evt_min"
                            type="number"
                            min="1"
                            max="120"
                            value={newEvent.minuto}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, minuto: parseInt(e.target.value) || 1 }))}
                            className="text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <Label htmlFor="evt_desc">Detalle / Comentario (opcional)</Label>
                          <Input
                            id="evt_desc"
                            value={newEvent.descripcion}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, descripcion: e.target.value }))}
                            placeholder="Ej: Gol de cabeza"
                            className="text-xs"
                          />
                        </div>

                        <Button type="submit" className="sm:col-span-2 bg-green-600 hover:bg-green-700">
                          Registrar Evento
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Lista de eventos del partido */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-800 text-sm flex items-center">
                      <FileText className="w-4 h-4 mr-1.5 text-blue-600" />
                      Línea de Tiempo del Partido
                    </h3>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {events.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No hay eventos registrados en este partido.</p>
                      ) : (
                        events.map((evt) => (
                          <div key={evt.id} className="p-3 border rounded-lg bg-gray-50 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-blue-600 text-sm min-w-[30px]">{evt.minuto}&apos;</span>
                              
                              {evt.tipo_evento === 'gol' && (
                                <Badge className="bg-green-500 text-white font-normal">Gol</Badge>
                              )}
                              {evt.tipo_evento === 'tarjeta_amarilla' && (
                                <Badge className="bg-yellow-500 text-black font-normal">Tarjeta Amarilla</Badge>
                              )}
                              {evt.tipo_evento === 'tarjeta_roja' && (
                                <Badge className="bg-red-500 text-white font-normal">Tarjeta Roja</Badge>
                              )}
                              {evt.tipo_evento === 'autogol' && (
                                <Badge className="bg-orange-500 text-white font-normal">Autogol</Badge>
                              )}

                              <div>
                                <span className="font-semibold text-gray-900">
                                  {evt.jugadores?.nombre} {evt.jugadores?.apellido}
                                </span>
                                <span className="text-gray-500 block text-[10px]">
                                  {evt.descripcion}
                                </span>
                              </div>
                            </div>

                            {matchStatus !== 'finalizado' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEvent(evt.id, evt.tipo_evento === 'gol', evt.equipo_id)}
                                className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
