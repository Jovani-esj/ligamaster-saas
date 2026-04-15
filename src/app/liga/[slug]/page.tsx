'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  descripcion?: string;
}

export default function LigaPage() {
  const params = useParams();
  const router = useRouter();
  const [liga, setLiga] = useState<Liga | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiga = async () => {
      if (!params.slug) return;

      try {
        const { data, error } = await supabase
          .from('ligas')
          .select('*')
          .eq('slug', params.slug)
          .single();

        if (error) {
          console.error('Error fetching liga:', error);
          router.push('/');
          return;
        }

        if (data) {
          setLiga(data);
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchLiga();
  }, [params.slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando liga...</p>
        </div>
      </div>
    );
  }

  if (!liga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Liga no encontrada</h1>
          <p className="text-gray-600 mb-8">La liga que buscas no existe o no está disponible.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{liga.nombre_liga}</h1>
            {liga.descripcion && (
              <p className="text-gray-600 text-lg">{liga.descripcion}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Equipos</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-blue-700 text-sm">Equipos registrados</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Temporada</h3>
              <p className="text-3xl font-bold text-green-600">2024</p>
              <p className="text-green-700 text-sm">Año actual</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Estado</h3>
              <p className="text-3xl font-bold text-purple-600">Activa</p>
              <p className="text-purple-700 text-sm">Estado de la liga</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Próximos Partidos</h2>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500">No hay partidos programados aún</p>
              <p className="text-sm text-gray-400 mt-2">Los partidos aparecerán aquí cuando se generen</p>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => router.push(`/${liga.slug}`)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Panel de Control
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
