'use client';
import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabase-service';
import { useAuth } from '@/components/auth/AuthenticationSystem';
import Link from 'next/link';
import { Trophy, Users, Calendar, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  descripcion: string;
  logo_url?: string;
  plan: 'Bronce' | 'Plata' | 'Oro';
  estatus_pago: boolean;
  activa: boolean;
  owner_id: string;
  contacto_email?: string;
  contacto_telefono?: string;
  created_at: string;
  updated_at: string;
}

export default function LigasPage() {
  const { isAuthenticated } = useAuth();
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchLigas();
  }, []);

  const fetchLigas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar el cliente de servicio para bypass RLS y mostrar todas las ligas
      const { data, error } = await supabaseService
        .from('ligas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ligas:', error);
        
        // Si es error de permisos RLS, mostrar mensaje informativo
        if (error.code === 'PGRST301' || error.message.includes('permission')) {
          setError('Para ver todas las ligas, el administrador debe configurar la clave de servicio de Supabase. Por ahora, solo se muestran ligas activas y pagadas.');
        } else {
          setError('No se pudieron cargar las ligas. Intenta de nuevo más tarde.');
        }
        
        toast.error('Error al cargar las ligas');
        return;
      }

      setLigas(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('Ocurrió un error inesperado. Intenta de nuevo.');
      toast.error('Error inesperado al cargar las ligas');
    } finally {
      setLoading(false);
    }
  };

  const filteredLigas = ligas.filter(liga => {
    const matchesSearch = liga.nombre_liga.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          liga.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          liga.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterType === 'all' || liga.plan === filterType;
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && liga.activa) ||
                          (filterStatus === 'inactive' && !liga.activa);
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Oro': return 'bg-yellow-100 text-yellow-800';
      case 'Plata': return 'bg-gray-100 text-gray-800';
      case 'Bronce': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (activa: boolean, estatus_pago: boolean) => {
    if (!activa) return 'bg-gray-100 text-gray-800';
    if (!estatus_pago) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (activa: boolean, estatus_pago: boolean) => {
    if (!activa) return 'Inactiva';
    if (!estatus_pago) return 'Pendiente de pago';
    return 'Activa';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando ligas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
              <div className="text-red-600 mb-4">
                <Trophy className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar ligas</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={fetchLigas} className="w-full">
                Intentar de nuevo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Ligas Disponibles</h1>
              <p className="text-gray-600">
                Explora las ligas disponibles o crea una nueva
              </p>
            </div>
            {isAuthenticated && (
              <Link href="/crear-liga">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Liga
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar ligas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los planes</option>
              <option value="Bronce">Bronce</option>
              <option value="Plata">Plata</option>
              <option value="Oro">Oro</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Se encontraron <span className="font-semibold">{filteredLigas.length}</span> ligas
          </p>
        </div>

        {/* Ligas Grid */}
        {filteredLigas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'No se encontraron ligas con esos filtros' 
                : 'No hay ligas disponibles'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Sé el primero en crear una liga'}
            </p>
            {isAuthenticated && (
              <Link href="/crear-liga">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Liga
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLigas.map((liga) => (
              <Card key={liga.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{liga.nombre_liga}</CardTitle>
                      <div className="flex gap-2 mb-2">
                        <Badge className={getPlanColor(liga.plan)}>
                          {liga.plan}
                        </Badge>
                        <Badge className={getStatusColor(liga.activa, liga.estatus_pago)}>
                          {getStatusText(liga.activa, liga.estatus_pago)}
                        </Badge>
                      </div>
                    </div>
                    <Trophy className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-2">
                    {liga.descripcion || 'Sin descripción disponible'}
                  </CardDescription>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>Slug: {liga.slug}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Plan: {liga.plan}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Creada: {new Date(liga.created_at).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/${liga.slug}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Ver liga
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
