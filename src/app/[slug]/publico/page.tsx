'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  estatus_pago: boolean;
}

interface Partido {
  id: string;
  liga_id: string;
  equipo_local_id: string;
  equipo_visitante_id: string;
  estado: string;
  fecha_jornada: string;
  marcador_local?: number;
  marcador_visitante?: number;
  local?: { nombre: string };
  visitante?: { nombre: string };
}

export default function ModuloPublico({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>('');
  const [liga, setLiga] = useState<Liga | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    
    const cargarDatosPublicos = async () => {
      const { data: ligaData } = await supabase
        .from('ligas')
        .select('*')
        .eq('slug', slug)
        .single();

      if (ligaData) {
        setLiga(ligaData);
        const { data: partidosData } = await supabase
          .from('partidos')
          .select(`
            *,
            local:equipo_local_id(nombre),
            visitante:equipo_visitante_id(nombre)
          `)
          .eq('liga_id', ligaData.id)
          .order('fecha_jornada', { ascending: true });
        
        if (partidosData) setPartidos(partidosData);
      }
    };
    cargarDatosPublicos();
  }, [slug]);

  if (!liga) return <div className="p-10 text-black">Cargando cartelera...</div>;

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <header className="border-b pb-4 mb-8">
        <h1 className="text-3xl font-bold text-blue-800">{liga.nombre_liga} - Sitio Oficial</h1>
        <p className="text-gray-500">Cartelera de Partidos y Resultados</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Próximos Encuentros</h2>
        <div className="space-y-4">
          {partidos.map((partido) => (
            <div key={partido.id} className="flex justify-between items-center border p-4 rounded-lg shadow-sm">
              <div className="flex-1 text-center font-bold text-lg">{partido.local?.nombre}</div>
              <div className="flex-none px-4 bg-gray-100 rounded py-1 font-mono text-xl">
                {partido.marcador_local ?? 0} - {partido.marcador_visitante ?? 0}
              </div>
              <div className="flex-1 text-center font-bold text-lg">{partido.visitante?.nombre}</div>
              <div className="ml-4 text-xs text-gray-400">
                {new Date(partido.fecha_jornada).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}