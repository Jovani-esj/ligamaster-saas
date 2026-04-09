'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Trophy, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  estatus_pago: boolean;
  descripcion?: string;
  created_at: string;
}

export default function BuscarLigas() {
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const cargarLigas = async () => {
      const { data } = await supabase
        .from('ligas')
        .select('*')
        .eq('estatus_pago', true)
        .order('created_at', { ascending: false });
      
      if (data) {
        setLigas(data);
      }
      setLoading(false);
    };
    
    cargarLigas();
  }, []);

  const filteredLigas = useMemo(() => {
    return ligas.filter(liga =>
      liga.nombre_liga.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liga.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (liga.descripcion && liga.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, ligas]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Buscar Ligas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra la liga perfecta para seguir tus equipos favoritos
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre, slug o descripción..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredLigas.length} {filteredLigas.length === 1 ? 'liga encontrada' : 'ligas encontradas'}
            </h2>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="text-sm"
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredLigas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLigas.map((liga) => (
                <Link key={liga.id} href={`/${liga.slug}`}>
                  <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                    <CardContent className="p-6 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {liga.nombre_liga}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                              /{liga.slug}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 shrink-0 ml-2">
                          Activa
                        </Badge>
                      </div>
                      
                      {liga.descripcion && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                          {liga.descripcion}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(liga.created_at).toLocaleDateString('es-ES')}
                        </div>
                        <div className="flex items-center text-blue-600 font-medium">
                          <span>Ver liga</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No se encontraron ligas' : 'No hay ligas disponibles'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'No hay ligas públicas disponibles en este momento'
                  }
                </p>
                {!searchTerm && (
                  <Link href="/crear-liga">
                    <Button>
                      <Trophy className="w-4 h-4 mr-2" />
                      Crear Nueva Liga
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
