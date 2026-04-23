'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, TrendingUp } from 'lucide-react';
import DashboardChart from '@/components/DashboardChart';
import SuspensionPage from '@/components/SuspensionPage';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  estatus_pago: boolean;
}

interface Equipo {
  id: string | null;
  nombre: string;
  liga_id: string;
}

export default function OrganizadorPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>('');
  const [liga, setLiga] = useState<Liga | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [editandoEquipo, setEditandoEquipo] = useState<Equipo | null>(null);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [numeroJugadores, setNumeroJugadores] = useState(0);
  const [jugadores, setJugadores] = useState<Array<{nombre: string, apellidos: string, edad: string, dorsal: string}>>([]);
  const [colorUniforme, setColorUniforme] = useState('#3B82F6');
  const [colorPortero, setColorPortero] = useState('#FF0000');
  const [mostrarPanelColores, setMostrarPanelColores] = useState(false);
  const [mostrarPanelColoresPortero, setMostrarPanelColoresPortero] = useState(false);
  const [graficaExpandida, setGraficaExpandida] = useState(false);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    
    const cargarDatos = async () => {
      const { data: ligaData } = await supabase
        .from('ligas')
        .select('*')
        .eq('slug', slug)
        .single();

      if (ligaData) {
        setLiga(ligaData);
        const { data: equiposData } = await supabase
          .from('equipos')
          .select('*')
          .eq('liga_id', ligaData.id);
        if (equiposData) setEquipos(equiposData);
      }
    };
    cargarDatos();
  }, [slug]);

  const registrarEquipo = async () => {
    if (!nombreEquipo || !liga) return;
    
    if (editandoEquipo) {
      // Editar equipo existente
      const { error } = await supabase
        .from('equipos')
        .update({ nombre: nombreEquipo })
        .eq('id', editandoEquipo.id);

      if (error) {
        toast.error('Error al actualizar equipo: ' + error.message);
      } else {
        toast.success('Equipo actualizado exitosamente');
        // Limpiar todos los estados y cerrar modal
        setNombreEquipo('');
        setEditandoEquipo(null);
        setMostrarModalEditar(false);
        setNumeroJugadores(0);
        setJugadores([]);
        setColorUniforme('#3B82F6');
        setColorPortero('#FF0000');
        setMostrarPanelColores(false);
        setMostrarPanelColoresPortero(false);
        // Recargar equipos
        const { data } = await supabase.from('equipos').select('*').eq('liga_id', liga.id);
        if (data) setEquipos(data);
      }
    } else {
      // Crear nuevo equipo
      const { error } = await supabase
        .from('equipos')
        .insert([{ 
          nombre: nombreEquipo, 
          liga_id: liga.id 
        }]);

      if (error) {
        toast.error('Error al registrar equipo: ' + error.message);
      } else {
        toast.success('Equipo registrado exitosamente');
        setNombreEquipo('');
        const { data } = await supabase.from('equipos').select('*').eq('liga_id', liga.id);
        if (data) setEquipos(data);
      }
    }
  };

  const handleEditarEquipo = (equipo: Equipo) => {
    setEditandoEquipo(equipo);
    setNombreEquipo(equipo.nombre);
    setMostrarModalEditar(true);
  };

  const handleNumeroJugadoresChange = (num: number) => {
    setNumeroJugadores(num);
    // Crear array de jugadores vacíos con el nuevo tamaño
    const nuevosJugadores = Array(num).fill(null).map(() => ({ 
      nombre: '', 
      apellidos: '', 
      edad: '', 
      dorsal: '' 
    }));
    setJugadores(nuevosJugadores);
  };

  const handleJugadorChange = (index: number, campo: 'nombre' | 'apellidos' | 'edad' | 'dorsal', valor: string) => {
    const nuevosJugadores = [...jugadores];
    nuevosJugadores[index] = {
      ...nuevosJugadores[index],
      [campo]: valor
    };
    setJugadores(nuevosJugadores);
  };

  const handleEliminarEquipo = async (equipoId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('equipos')
        .delete()
        .eq('id', equipoId);

      if (error) {
        toast.error('Error al eliminar equipo: ' + error.message);
      } else {
        toast.success('Equipo eliminado exitosamente');
        // Recargar la lista de equipos
        if (liga) {
          const { data } = await supabase.from('equipos').select('*').eq('liga_id', liga.id);
          if (data) setEquipos(data);
        }
      }
    } catch (error) {
      toast.error('Error al eliminar equipo');
    }
  };

  const generarCalendario = async () => {
    if (equipos.length < 2) {
      toast.error("Necesitas al menos 2 equipos para generar un torneo.");
      return;
    }

    if (!liga) {
      toast.error("Error: datos de la liga no disponibles.");
      return;
    }

    // Buscar o crear un torneo para esta liga
    let torneoId: string;
    
    // Primero buscar si ya existe un torneo activo para esta liga
    const { data: torneosExistentes } = await supabase
      .from('torneos')
      .select('id, nombre')
      .eq('liga_id', liga.id)
      .eq('activo', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (torneosExistentes && torneosExistentes.length > 0) {
      torneoId = torneosExistentes[0].id;
      toast.info(`Usando torneo existente: ${torneosExistentes[0].nombre}`);
    } else {
      // Crear un nuevo torneo
      const nombreTorneo = `Torneo ${new Date().getFullYear()}`;
      const { data: nuevoTorneo, error: errorTorneo } = await supabase
        .from('torneos')
        .insert([{
          liga_id: liga.id,
          nombre: nombreTorneo,
          activo: true
        }])
        .select('id, nombre')
        .single();

      if (errorTorneo || !nuevoTorneo) {
        toast.error("Error al crear torneo: " + (errorTorneo?.message || 'Error desconocido'));
        return;
      }

      torneoId = nuevoTorneo.id;
      toast.success(`Torneo creado: ${nuevoTorneo.nombre}`);
    }

    // Si el número de equipos es impar, se añade un "BYE" (descanso)
    const listaEquipos = [...equipos];
    if (listaEquipos.length % 2 !== 0) {
      listaEquipos.push({ id: null, nombre: 'DESCANSO', liga_id: liga.id });
    }

    const numEquipos = listaEquipos.length;
    const numRondas = numEquipos - 1;
    const partidosPorRonda = numEquipos / 2;
    const nuevosPartidos = [];

    for (let ronda = 0; ronda < numRondas; ronda++) {
      for (let i = 0; i < partidosPorRonda; i++) {
        const local = listaEquipos[i];
        const visitante = listaEquipos[numEquipos - 1 - i];

        // Solo guardar si ninguno es el equipo de descanso
        if (local.id && visitante.id) {
          nuevosPartidos.push({
            liga_id: liga.id,
            torneo_id: torneoId,
            equipo_local_id: local.id,
            equipo_visitante_id: visitante.id,
            estado: 'programado',
            fecha_jornada: new Date() // Aquí podrías sumar días por cada ronda
          });
        }
      }
      // Rotación de Round Robin: el primer equipo se queda fijo, los demás rotan
      listaEquipos.splice(1, 0, listaEquipos.pop()!);
    }

    // Insertar en Supabase
    const { error } = await supabase.from('partidos').insert(nuevosPartidos);
    
    if (error) {
      toast.error("Error al generar calendario: " + error.message);
    } else {
      toast.success(`¡Calendario generado! ${nuevosPartidos.length} partidos creados.`);
    }
  };

  if (!liga) return <p className="p-10 text-black">Cargando datos de la liga...</p>;
  
  if (!liga.estatus_pago) {
    return <SuspensionPage />;
  }

  const chartData = [
    { jornada: 'Jornada 1', goles: 12 },
    { jornada: 'Jornada 2', goles: 8 },
    { jornada: 'Jornada 3', goles: 15 },
    { jornada: 'Jornada 4', goles: 10 },
    { jornada: 'Jornada 5', goles: 9 },
    { jornada: 'Jornada 6', goles: 14 },
    { jornada: 'Jornada 7', goles: 11 },
    { jornada: 'Jornada 8', goles: 13 },
    { jornada: 'Jornada 9', goles: 7 },
    { jornada: 'Jornada 10', goles: 16 },
    { jornada: 'Jornada 11', goles: 10 },
    { jornada: 'Jornada 12', goles: 12 },
    { jornada: 'Jornada 13', goles: 9 },
    { jornada: 'Jornada 14', goles: 15 },
    { jornada: 'Jornada 15', goles: 8 },
    { jornada: 'Jornada 16', goles: 11 },
    { jornada: 'Jornada 17', goles: 14 },
    { jornada: 'Jornada 18', goles: 10 },
    { jornada: 'Jornada 19', goles: 13 },
    { jornada: 'Jornada 20', goles: 9 },
    { jornada: 'Jornada 21', goles: 12 },
  ];

  return (
    <div className="p-4 md:p-8 text-black min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Panel de Control</h1>
        <p className="text-gray-600">Gestionando: {liga.nombre_liga}</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{equipos.length}</p>
                <p className="text-sm text-gray-600">Equipos Registrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{equipos.length >= 2 ? (equipos.length - 1) * equipos.length : 0}</p>
                <p className="text-sm text-gray-600">Partidos Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">11.3</p>
                <p className="text-sm text-gray-600">Prom. Goles/Jornada</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registrar Equipo */}
        <Card>
          <CardHeader>
            <CardTitle>{editandoEquipo ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}</CardTitle>
          </CardHeader>
          <CardContent>
            <input 
              type="text" 
              value={nombreEquipo}
              onChange={(e) => setNombreEquipo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre del equipo"
            />
            <div className="flex space-x-2">
              <Button onClick={registrarEquipo} className="flex-1">
                {editandoEquipo ? 'Actualizar Equipo' : 'Guardar Equipo'}
              </Button>
              {editandoEquipo && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditandoEquipo(null);
                    setNombreEquipo('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Equipos Registrados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Equipos Registrados
              <Badge variant="secondary">{equipos.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {equipos.map(eq => (
                <div key={eq.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                  <span className="font-medium">{eq.nombre}</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditarEquipo(eq)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => eq.id && handleEliminarEquipo(eq.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="mt-8">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGraficaExpandida(!graficaExpandida)}
            className="flex items-center space-x-2"
          >
            {graficaExpandida ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
                <span>Contraer</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>Expandir</span>
              </>
            )}
          </Button>
        </div>
        
        <div className={graficaExpandida ? "overflow-x-auto" : ""}>
          <div style={graficaExpandida ? { minWidth: '1500px' } : {}}>
            <DashboardChart data={chartData} />
          </div>
        </div>
      </div>

      {/* Calendar Generator */}
      {equipos.length >= 2 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Generador de Calendario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Crea todos los encuentros de la temporada automáticamente usando el algoritmo Round Robin.
            </p>
            <Button 
              onClick={generarCalendario}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Generar Rol de Juegos Automático
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal Flotante para Editar Equipo */}
      {mostrarModalEditar && (
        <div className="fixed inset-0 bg-blue-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Editar Equipo</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Equipo
              </label>
              <div className="space-y-2">
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={nombreEquipo}
                  onChange={(e) => setNombreEquipo(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del equipo"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMostrarPanelColores(!mostrarPanelColores)}
                  className="flex items-center space-x-2 whitespace-nowrap"
                >
                  <div 
                    className="w-4 h-4 rounded border border-gray-300" 
                    style={{ backgroundColor: colorUniforme }}
                  />
                  <span>Uniforme de Jugadores</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMostrarPanelColoresPortero(!mostrarPanelColoresPortero)}
                  className="flex items-center space-x-2 whitespace-nowrap"
                >
                  <div 
                    className="w-4 h-4 rounded border border-gray-300" 
                    style={{ backgroundColor: colorPortero }}
                  />
                  <span>Uniforme de Portero</span>
                </Button>
              </div>
            </div>
            </div>

            {/* Panel de Colores para Uniforme */}
            {mostrarPanelColores && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecciona el Color de la Playera
                </label>
                <div className="grid grid-cols-8 gap-2 mb-3">
                  {[
                    '#FF0000', '#FF4500', '#FFA500', '#FFFF00', 
                    '#00FF00', '#00CED1', '#0000FF', '#4B0082',
                    '#8B008B', '#FF1493', '#FF69B4', '#FFC0CB',
                    '#F0F0F0', '#808080', '#000000', '#FFFFFF',
                    '#8B4513', '#A52A2A', '#D2691E', '#CD853F',
                    '#F4A460', '#D2B48C', '#BC8F8F', '#F5DEB3',
                    '#800000', '#8B0000', '#B22222', '#DC143C',
                    '#000080', '#00008B', '#0000CD', '#4169E1',
                    '#1E90FF', '#00BFFF', '#87CEEB', '#87CEFA',
                    '#4682B4', '#5F9EA0', '#6495ED', '#008080'
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setColorUniforme(color)}
                      className={`w-8 h-8 rounded border-2 transition-all ${
                        colorUniforme === color ? 'border-blue-500 scale-110' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Color personalizado:</label>
                  <input 
                    type="color" 
                    value={colorUniforme}
                    onChange={(e) => setColorUniforme(e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={colorUniforme}
                    onChange={(e) => setColorUniforme(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    placeholder="#3B82F6"
                  />
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="text-sm text-gray-600">Vista previa:</div>
                  <div 
                    className="w-16 h-16 rounded border-2 border-gray-300 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: colorUniforme }}
                  >
                    <span className="text-xs">UNIFORME</span>
                  </div>
                </div>
              </div>
            )}

            {/* Panel de Colores para Uniforme de Portero */}
            {mostrarPanelColoresPortero && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecciona el Color del Uniforme del Portero
                </label>
                <div className="grid grid-cols-8 gap-2 mb-3">
                  {[
                    '#FF0000', '#FF4500', '#FFA500', '#FFFF00', 
                    '#00FF00', '#00CED1', '#0000FF', '#4B0082',
                    '#8B008B', '#FF1493', '#FF69B4', '#FFC0CB',
                    '#F0F0F0', '#808080', '#000000', '#FFFFFF',
                    '#8B4513', '#A52A2A', '#D2691E', '#CD853F',
                    '#F4A460', '#D2B48C', '#BC8F8F', '#F5DEB3',
                    '#800000', '#8B0000', '#B22222', '#DC143C',
                    '#000080', '#00008B', '#0000CD', '#4169E1',
                    '#1E90FF', '#00BFFF', '#87CEEB', '#87CEFA',
                    '#4682B4', '#5F9EA0', '#6495ED', '#008080'
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setColorPortero(color)}
                      className={`w-8 h-8 rounded border-2 transition-all ${
                        colorPortero === color ? 'border-blue-500 scale-110' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Color personalizado:</label>
                  <input 
                    type="color" 
                    value={colorPortero}
                    onChange={(e) => setColorPortero(e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={colorPortero}
                    onChange={(e) => setColorPortero(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    placeholder="#FF0000"
                  />
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="text-sm text-gray-600">Vista previa:</div>
                  <div 
                    className="w-16 h-16 rounded border-2 border-gray-300 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: colorPortero }}
                  >
                    <span className="text-xs">PORTERO</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Jugadores
              </label>
              <input 
                type="text" 
                value={numeroJugadores === 0 ? '' : numeroJugadores}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setNumeroJugadores(0);
                    setJugadores([]);
                  } else {
                    const num = parseInt(value);
                    if (!isNaN(num) && num >= 0 && num <= 30) {
                      handleNumeroJugadoresChange(num);
                    }
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese número de jugadores"
              />
            </div>

            {/* Campos dinámicos para jugadores */}
            {numeroJugadores > 0 && (
              <div className="mb-4 max-h-48 overflow-y-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jugadores del Equipo
                </label>
                <div className="space-y-2">
                  {jugadores.map((jugador, index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        Jugador {index + 1}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <input 
                            type="text" 
                            value={jugador.nombre}
                            onChange={(e) => handleJugadorChange(index, 'nombre', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Nombre"
                          />
                        </div>
                        <div>
                          <input 
                            type="text" 
                            value={jugador.apellidos}
                            onChange={(e) => handleJugadorChange(index, 'apellidos', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Apellidos"
                          />
                        </div>
                        <div>
                          <input 
                            type="number" 
                            value={jugador.edad}
                            onChange={(e) => handleJugadorChange(index, 'edad', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Edad"
                            min="16"
                            max="50"
                          />
                        </div>
                        <div>
                          <input 
                            type="number" 
                            value={jugador.dorsal}
                            onChange={(e) => handleJugadorChange(index, 'dorsal', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Dorsal"
                            min="1"
                            max="99"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button 
                onClick={registrarEquipo}
                className="flex-1"
              >
                Actualizar Equipo
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setMostrarModalEditar(false);
                  setEditandoEquipo(null);
                  setNombreEquipo('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}