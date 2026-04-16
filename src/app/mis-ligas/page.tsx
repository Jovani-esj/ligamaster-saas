'use client';
import { useEffect, useState } from 'react';
import RouteProtection from '@/components/auth/RouteProtection';
import { Trophy, Users, Calendar, DollarSign, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import Link from 'next/link';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  plan: 'Bronce' | 'Plata' | 'Oro';
  estatus_pago: boolean;
  fecha_registro: string;
  fecha_vencimiento?: string;
  rol_usuario: 'admin_liga' | 'usuario';
}

export default function MisLigasPage() {
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLigas();
  }, []);

  const fetchLigas = async () => {
    try {
      // Simulación - en un caso real, esto vendría de la API
      const mockLigas: Liga[] = [
        {
          id: '1',
          nombre_liga: 'Liga Premier de Fútbol',
          slug: 'liga-premier',
          plan: 'Oro',
          estatus_pago: true,
          fecha_registro: '2024-01-15',
          fecha_vencimiento: '2024-12-31',
          rol_usuario: 'admin_liga'
        },
        {
          id: '2',
          nombre_liga: 'Liga Amateur de Baloncesto',
          slug: 'liga-basket',
          plan: 'Plata',
          estatus_pago: true,
          fecha_registro: '2024-02-20',
          fecha_vencimiento: '2024-11-30',
          rol_usuario: 'usuario'
        },
        {
          id: '3',
          nombre_liga: 'Liga Juvenil de Fútbol',
          slug: 'liga-juvenil',
          plan: 'Bronce',
          estatus_pago: false,
          fecha_registro: '2024-03-10',
          fecha_vencimiento: '2024-09-30',
          rol_usuario: 'usuario'
        }
      ];

      setLigas(mockLigas);
    } catch (error) {
      console.error('Error fetching ligas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Oro': return 'text-yellow-600 bg-yellow-100';
      case 'Plata': return 'text-gray-600 bg-gray-100';
      case 'Bronce': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'Oro': return '👑';
      case 'Plata': return '🥈';
      case 'Bronce': return '🥉';
      default: return '⚽';
    }
  };

  const isVencida = (fechaVencimiento?: string) => {
    if (!fechaVencimiento) return false;
    return new Date(fechaVencimiento) < new Date();
  };

  if (loading) {
    return (
      <RouteProtection requireAuth={true}>
        <div className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus ligas...</p>
          </div>
        </div>
      </RouteProtection>
    );
  }

  return (
    <RouteProtection requireAuth={true}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Ligas</h1>
            <p className="text-gray-600">
              Gestiona las ligas en las que participas o administras
            </p>
          </div>

          {ligas.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes ligas asignadas
              </h3>
              <p className="text-gray-600 mb-6">
                Únete a una liga existente o crea tu propia liga para comenzar.
              </p>
              <div className="space-y-4">
                <Link
                  href="/buscar"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Buscar Ligas
                </Link>
                <Link
                  href="/crear-liga"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  Crear Nueva Liga
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ligas.map((liga) => (
                <div
                  key={liga.id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getPlanIcon(liga.plan)}</span>
                        <h3 className="text-xl font-bold text-gray-900">
                          {liga.nombre_liga}
                        </h3>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getPlanColor(liga.plan)}`}>
                        {liga.plan}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Creada: {new Date(liga.fecha_registro).toLocaleDateString()}
                      </div>
                      {liga.fecha_vencimiento && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Vence: {new Date(liga.fecha_vencimiento).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {liga.estatus_pago ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-600 font-medium">Activa</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <span className="text-red-600 font-medium">Suspendida</span>
                          </>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        liga.rol_usuario === 'admin_liga' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {liga.rol_usuario === 'admin_liga' ? 'Administrador' : 'Usuario'}
                      </div>
                    </div>

                    {isVencida(liga.fecha_vencimiento) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-red-800 text-sm">
                          <strong>⚠️ Atención:</strong> La suscripción de esta liga está vencida. 
                          {liga.rol_usuario === 'admin_liga' ? ' Contacta al SuperAdmin para renovar.' : ' Contacta al administrador de tu liga.'}
                        </p>
                      </div>
                    )}

                    {!liga.estatus_pago && !isVencida(liga.fecha_vencimiento) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-yellow-800 text-sm">
                          <strong>⚠️ Atención:</strong> Esta liga se encuentra suspendida por falta de pago.
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <Link
                        href={`/${liga.slug}`}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Acceder a Liga
                      </Link>
                      
                      {liga.rol_usuario === 'admin_liga' && (
                        <Link
                          href={`/${liga.slug}/admin`}
                          className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Administrar
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RouteProtection>
  );
}
