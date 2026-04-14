'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Search, Users, TrendingUp, Star, ArrowRight, Shield } from 'lucide-react';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  estatus_pago: boolean;
  descripcion?: string;
}

export default function Home() {
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarLigas = async () => {
      const { data } = await supabase
        .from('ligas')
        .select('*')
        .eq('estatus_pago', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (data) setLigas(data);
      setLoading(false);
    };
    
    cargarLigas();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Trophy className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              LigaMaster
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Plataforma profesional para gestión de ligas deportivas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/buscar">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Search className="w-5 h-5 mr-2" />
                  Explorar Ligas
                </Button>
              </Link>
              <Link href="/crear-liga">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Crear Mi Liga
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todo lo que necesitas para administrar tu liga de manera profesional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Gestión de Equipos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Registra y administra todos los equipos de tu liga con información detallada y estadísticas en tiempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Estadísticas Avanzadas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Gráficas interactivas y análisis detallados del rendimiento de equipos y jugadores.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Modo Multi-Tenant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Aislamiento completo de datos entre ligas con seguridad y privacidad garantizada.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Leagues Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ligas Populares
            </h2>
            <p className="text-xl text-gray-600">
              Descubre las ligas más activas de nuestra plataforma
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : ligas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ligas.map((liga) => (
                <Link key={liga.id} href={`/${liga.slug}`}>
                  <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {liga.nombre_liga}
                          </h3>
                          <p className="text-sm text-gray-500">
                            /{liga.slug}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Activa
                        </Badge>
                      </div>
                      
                      {liga.descripcion && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {liga.descripcion}
                        </p>
                      )}
                      
                      <div className="flex items-center text-blue-600 font-medium">
                        <span>Ver detalles</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay ligas públicas aún
                </h3>
                <p className="text-gray-600 mb-6">
                  Sé el primero en crear una liga y empezar a disfrutar de nuestra plataforma
                </p>
                <Link href="/crear-liga">
                  <Button>
                    Crear Primera Liga
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="text-center mt-12">
            <Link href="/buscar">
              <Button variant="outline" size="lg">
                Ver Todas las Ligas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para administrar tu liga?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Únete a cientos de administradores que ya confían en LigaMaster
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/crear-liga">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Star className="w-5 h-5 mr-2" />
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Ver Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-8 w-8" />
                <span className="text-xl font-bold">LigaMaster</span>
              </div>
              <p className="text-gray-400">
                La plataforma líder para gestión de ligas deportivas.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/caracteristicas" className="hover:text-white">Características</Link></li>
                <li><Link href="/precios" className="hover:text-white">Precios</Link></li>
                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/ayuda" className="hover:text-white">Centro de Ayuda</Link></li>
                <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacidad" className="hover:text-white">Privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-white">Términos</Link></li>
                <li><Link href="/seguridad" className="hover:text-white">Seguridad</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LigaMaster. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
