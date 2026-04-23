'use client';
import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Users, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Crown,
  Shield,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  descripcion?: string;
  estatus_pago: boolean;
  activa: boolean;
  plan: string;
  owner_id?: string;
  created_at: string;
}

export default function GestionLigasPage() {
  const { profile } = useSimpleAuth();
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.rol === 'adminadmin' || profile?.rol === 'superadmin';

  useEffect(() => {
    if (isAdmin) {
      cargarLigas();
    }
  }, [isAdmin]);

  const cargarLigas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ligas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLigas(data || []);
    } catch (error) {
      console.error('Error cargando ligas:', error);
      toast.error('Error al cargar las ligas');
    } finally {
      setLoading(false);
    }
  };

  const toggleLigaStatus = async (ligaId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ligas')
        .update({ activa: !currentStatus })
        .eq('id', ligaId);

      if (error) throw error;

      toast.success(`Liga ${!currentStatus ? 'activada' : 'suspendida'} exitosamente`);
      cargarLigas();
    } catch (error) {
      console.error('Error actualizando liga:', error);
      toast.error('Error al actualizar la liga');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600 mb-6">
              Solo administradores del sistema pueden gestionar ligas.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Volver al Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando ligas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Crown className="w-8 h-8 mr-3 text-yellow-600" />
                Gestión de Ligas
              </h1>
              <p className="text-gray-600">
                Administrar todas las ligas del sistema
              </p>
            </div>
            <Link href="/admin-admin">
              <Button variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Panel Admin
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Ligas</p>
                  <p className="text-2xl font-bold text-gray-900">{ligas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {ligas.filter(l => l.activa).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pago Pendiente</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {ligas.filter(l => !l.estatus_pago).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Planes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(ligas.map(l => l.plan)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ligas List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Lista de Ligas
              </span>
              <Badge variant="secondary">{ligas.length} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Liga</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Pago</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ligas.map((liga) => (
                    <tr key={liga.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{liga.nombre_liga}</p>
                          <p className="text-sm text-gray-500">/{liga.slug}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={liga.plan === 'Oro' ? 'default' : liga.plan === 'Plata' ? 'secondary' : 'outline'}
                        >
                          {liga.plan}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {liga.activa ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                              <span className="text-sm text-gray-900">Activa</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500 mr-1" />
                              <span className="text-sm text-gray-900">Inactiva</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={liga.estatus_pago ? 'default' : 'destructive'}>
                          {liga.estatus_pago ? 'Pagada' : 'Pendiente'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Link href={`/liga/${liga.slug}`}>
                            <Button variant="outline" size="sm">
                              Ver
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleLigaStatus(liga.id, liga.activa)}
                            className={liga.activa ? 'text-red-600' : 'text-green-600'}
                          >
                            {liga.activa ? 'Suspender' : 'Activar'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
