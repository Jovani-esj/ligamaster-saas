'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, Settings, Plus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  estatus_pago: boolean;
  descripcion?: string;
}


export default function MisLigas() {
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [equiposCount, setEquiposCount] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarMisLigas = async () => {
      try {
        // Cargar ligas del usuario actual
        // Nota: Asumimos que hay una columna 'organizador_id' o similar
        // Si no existe, mostraremos todas las ligas por ahora
        const { data: ligasData, error: ligasError } = await supabase
          .from('ligas')
          .select('*')
          .order('id', { ascending: false });

        if (ligasError) {
          toast.error('Error al cargar las ligas: ' + ligasError.message);
          return;
        }

        if (ligasData) {
          setLigas(ligasData);

          // Para cada liga, contar los equipos
          const counts: { [key: string]: number } = {};
          for (const liga of ligasData) {
            const { data: equiposData } = await supabase
              .from('equipos')
              .select('id')
              .eq('liga_id', liga.id);
            
            counts[liga.id] = equiposData?.length || 0;
          }
          setEquiposCount(counts);
        }
      } catch (error) {
        toast.error('Error inesperado al cargar las ligas');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarMisLigas();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Ligas</h1>
            <p className="text-gray-600">Gestiona todas tus ligas desde un solo lugar</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Ligas</h1>
              <p className="text-gray-600">Gestiona todas tus ligas desde un solo lugar</p>
            </div>
            <Link href="/crear-liga">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Crear Nueva Liga
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ligas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes ligas creadas
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primera liga y empieza a gestionar tus torneos deportivos
              </p>
              <Link href="/crear-liga">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Mi Primera Liga
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Trophy className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{ligas.length}</p>
                      <p className="text-sm text-gray-600">Total de Ligas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {Object.values(equiposCount).reduce((a, b) => a + b, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total de Equipos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {ligas.filter(l => l.estatus_pago).length}
                      </p>
                      <p className="text-sm text-gray-600">Ligas Activas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leagues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ligas.map((liga) => (
                <Card key={liga.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{liga.nombre_liga}</CardTitle>
                        <p className="text-sm text-gray-500">/{liga.slug}</p>
                      </div>
                      <Badge 
                        variant={liga.estatus_pago ? "default" : "secondary"}
                        className={liga.estatus_pago ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {liga.estatus_pago ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {liga.descripcion && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {liga.descripcion}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{equiposCount[liga.id] || 0} equipos</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/${liga.slug}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Administrar
                        </Button>
                      </Link>
                      <Link href={`/${liga.slug}/publico`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
