'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

    if (error) alert(error.message);
    else {
      setNombreEquipo('');
      const { data } = await supabase.from('equipos').select('*').eq('liga_id', liga.id);
      if (data) setEquipos(data);
    }
  };

  const generarCalendario = async () => {
    if (equipos.length < 2) {
      alert("Necesitas al menos 2 equipos para generar un torneo.");
      return;
    }

    if (!liga) {
      alert("Error: datos de la liga no disponibles.");
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
    
    if (error) alert("Error al generar: " + error.message);
    else alert("¡Calendario Round Robin generado con éxito!");
  };

  if (!liga) return <p className="p-10 text-black">Cargando datos de la liga...</p>;
  
  if (!liga.estatus_pago) {
    return (
      <div className="p-10 bg-red-100 text-red-800 min-h-screen font-bold text-center">
        <h1 className="text-4xl mb-4">SERVICIO SUSPENDIDO</h1>
        <p>Esta liga no ha realizado su pago de suscripción.</p>
      </div>
    );
  }

  return (
    <div className="p-8 text-black min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Organizador: {liga.nombre_liga}</h1>
      
      <div className="bg-white p-6 rounded shadow-md max-w-md mb-8">
        <h2 className="text-lg font-bold mb-4">Registrar Equipo</h2>
        <input 
          type="text" 
          value={nombreEquipo}
          onChange={(e) => setNombreEquipo(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          placeholder="Nombre del equipo"
        />
        <button onClick={registrarEquipo} className="bg-green-600 text-white p-2 w-full rounded hover:bg-green-700">
          Guardar Equipo
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Equipos Registrados</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {equipos.map(eq => (
            <div key={eq.id} className="p-4 border bg-white rounded shadow-sm">
              {eq.nombre}
            </div>
          ))}
        </div>
        
        {equipos.length >= 2 && (
          <div className="mt-8 p-6 bg-white rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Generador de Calendario</h2>
            <p className="text-sm text-gray-600 mb-4">
              Crea todos los encuentros de la temporada automáticamente usando el algoritmo Round Robin.
            </p>
            <button 
              onClick={generarCalendario}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold"
            >
              Generar Rol de Juegos Automático
            </button>
          </div>
        )}
      </div>
    </div>
  );
}