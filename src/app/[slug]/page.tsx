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
            torneo_id: 'TU_TORNEO_ID_AQUÍ', // Deberás crear un torneo primero o usar uno genérico
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
      toast.success("¡Calendario Round Robin generado con éxito!");
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
            <CardTitle>Registrar Nuevo Equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <input 
              type="text" 
              value={nombreEquipo}
              onChange={(e) => setNombreEquipo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre del equipo"
            />
            <Button onClick={registrarEquipo} className="w-full">
              Guardar Equipo
            </Button>
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
                <div key={eq.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-medium">{eq.nombre}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="mt-8">
        <DashboardChart data={chartData} />
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
    </div>
  );
}