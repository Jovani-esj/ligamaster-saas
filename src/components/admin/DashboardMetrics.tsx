'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

interface Metrics {
  totalLigas: number;
  ligasActivas: number;
  ligasInactivas: number;
  ingresosMensuales: number;
  ligasPorPlan: {
    Bronce: number;
    Plata: number;
    Oro: number;
  };
  ultimasLigas: Array<{
    id: string;
    nombre_liga: string;
    slug: string;
    plan: string;
    fecha_registro: string;
    estatus_pago: boolean;
  }>;
}

export default function DashboardMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Obtener métricas básicas
      const { data: ligas, error } = await supabase
        .from('ligas')
        .select('*')
        .order('fecha_registro', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Calcular métricas
      const totalLigas = ligas?.length || 0;
      const ligasActivas = ligas?.filter(l => l.estatus_pago && l.activa).length || 0;
      const ligasInactivas = totalLigas - ligasActivas;

      // Calcular ingresos mensuales (simulados)
      const precios = { Bronce: 100, Plata: 200, Oro: 500 };
      const ingresosMensuales = ligas?.reduce((total, liga) => {
        return total + (liga.estatus_pago ? precios[liga.plan as keyof typeof precios] : 0);
      }, 0) || 0;

      // Agrupar por plan
      const ligasPorPlan = ligas?.reduce((acc, liga) => {
        acc[liga.plan as keyof typeof acc] = (acc[liga.plan as keyof typeof acc] || 0) + 1;
        return acc;
      }, { Bronce: 0, Plata: 0, Oro: 0 }) || { Bronce: 0, Plata: 0, Oro: 0 };

      setMetrics({
        totalLigas,
        ligasActivas,
        ligasInactivas,
        ingresosMensuales,
        ligasPorPlan,
        ultimasLigas: ligas?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Cargando métricas...</div>;
  }

  if (!metrics) {
    return <div className="p-8">Error al cargar las métricas</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard SuperAdmin</h1>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ligas</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalLigas}</p>
            </div>
            <Trophy className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ligas Activas</p>
              <p className="text-2xl font-bold text-green-600">{metrics.ligasActivas}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ligas Inactivas</p>
              <p className="text-2xl font-bold text-red-600">{metrics.ligasInactivas}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
              <p className="text-2xl font-bold text-gray-900">${metrics.ingresosMensuales}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Distribución por planes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Distribución por Planes</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Plan Bronce</span>
              <span className="font-semibold text-orange-600">{metrics.ligasPorPlan.Bronce} ligas</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Plan Plata</span>
              <span className="font-semibold text-gray-600">{metrics.ligasPorPlan.Plata} ligas</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Plan Oro</span>
              <span className="font-semibold text-yellow-600">{metrics.ligasPorPlan.Oro} ligas</span>
            </div>
          </div>
        </div>

        {/* Últimas ligas registradas */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Últimas Ligas Registradas</h2>
          <div className="space-y-3">
            {metrics.ultimasLigas.map((liga) => (
              <div key={liga.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{liga.nombre_liga}</p>
                  <p className="text-sm text-gray-600">/{liga.slug}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    liga.estatus_pago 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {liga.estatus_pago ? 'Activa' : 'Inactiva'}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{liga.plan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
