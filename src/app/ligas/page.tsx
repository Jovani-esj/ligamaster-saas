'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Users, Calendar, ArrowRight } from 'lucide-react';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  descripcion?: string;
}

export default function LigasPage() {
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLigas = async () => {
      try {
        const response = await fetch('/api/ligas');
        const result = await response.json();
        
        if (result.data) {
          setLigas(result.data);
        }
      } catch (error) {
        console.error('Error fetching leagues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLigas();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ligas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ligas Disponibles</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explora todas las ligas disponibles y únete a la competencia
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{ligas.length}</h3>
            <p className="text-gray-600">Ligas Activas</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">0</h3>
            <p className="text-gray-600">Equipos Totales</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">2024</h3>
            <p className="text-gray-600">Temporada</p>
          </div>
        </div>

        {/* Ligas Grid */}
        {ligas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ligas.map((liga) => (
              <div key={liga.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-blue-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                    {liga.nombre_liga}
                  </h3>
                  
                  {liga.descripcion && (
                    <p className="text-gray-600 text-center mb-6 line-clamp-3">
                      {liga.descripcion}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Equipos:</span>
                      <span className="font-medium text-gray-900">0</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Estado:</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Activa
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <Link 
                      href={`/liga/${liga.slug}`}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Ver Detalles</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    
                    <Link 
                      href={`/${liga.slug}`}
                      className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span>Panel de Control</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
              <Trophy className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay ligas disponibles</h3>
            <p className="text-gray-600">No se encontraron ligas en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
