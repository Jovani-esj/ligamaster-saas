'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">{liga.nombre_liga}</h1>
              <p className="text-gray-600 mt-1">Sitio Oficial - Cartelera de Partidos</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Badge variant="outline" className="text-sm">
                <Trophy className="w-4 h-4 mr-1" />
                Temporada 2024
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Próximos Encuentros</h2>
          
          {partidos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay partidos programados aún</p>
                <p className="text-sm text-gray-500 mt-2">Vuelve pronto para ver los próximos encuentros</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {partidos.map((partido) => (
                <Card key={partido.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    {/* Mobile Layout - Vertical */}
                    <div className="flex flex-col sm:hidden space-y-3">
                      <div className="text-center">
                        <p className="font-bold text-lg">{partido.local?.nombre}</p>
                      </div>
                      <div className="flex justify-center items-center space-x-3">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-bold text-lg">
                          {partido.marcador_local ?? 0}
                        </div>
                        <span className="text-gray-500 font-semibold">VS</span>
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-bold text-lg">
                          {partido.marcador_visitante ?? 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">{partido.visitante?.nombre}</p>
                      </div>
                      <div className="text-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {new Date(partido.fecha_jornada).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Desktop Layout - Horizontal */}
                    <div className="hidden sm:flex justify-between items-center">
                      <div className="flex-1 text-center">
                        <p className="font-bold text-lg">{partido.local?.nombre}</p>
                      </div>
                      <div className="flex-none px-6 bg-gray-100 rounded-lg py-2">
                        <div className="font-mono text-xl font-bold text-center">
                          {partido.marcador_local ?? 0} - {partido.marcador_visitante ?? 0}
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="font-bold text-lg">{partido.visitante?.nombre}</p>
                      </div>
                      <div className="ml-6 text-sm text-gray-500 whitespace-nowrap">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {new Date(partido.fecha_jornada).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{partidos.length}</p>
              <p className="text-sm text-gray-600">Partidos Totales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {partidos.filter(p => p.estado === 'finalizado').length}
              </p>
              <p className="text-sm text-gray-600">Partidos Jugados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {partidos.filter(p => p.estado === 'programado').length}
              </p>
              <p className="text-sm text-gray-600">Próximos Partidos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}