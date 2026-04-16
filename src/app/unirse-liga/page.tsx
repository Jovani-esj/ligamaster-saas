'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Search, Send, CheckCircle, Clock, XCircle, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LigaDisponible, SolicitudEquipoConDetalles } from '@/types/database';
import { createSolicitudEquipo, getSolicitudesPorCapitan, getLigasDisponibles } from '@/lib/database';

export default function UnirseLigaPage() {
  const { user, profile } = useSimpleAuth();
  const [ligas, setLigas] = useState<LigaDisponible[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudEquipoConDetalles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLiga, setSelectedLiga] = useState<LigaDisponible | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre_equipo: '',
    mensaje: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const isCapitan = profile?.rol === 'capitan_equipo';

  const cargarDatos = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Cargar ligas disponibles
      const ligasData = await getLigasDisponibles();
      setLigas(ligasData);
      
      // Cargar solicitudes del capitán
      const solicitudesData = await getSolicitudesPorCapitan(user.id);
      setSolicitudes(solicitudesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user, cargarDatos]);

  const handleSolicitar = (liga: LigaDisponible) => {
    setSelectedLiga(liga);
    setShowForm(true);
    setFormData({ nombre_equipo: '', mensaje: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLiga || !user?.id) return;

    if (!formData.nombre_equipo.trim()) {
      toast.error('El nombre del equipo es requerido');
      return;
    }

    setSubmitting(true);
    try {
      await createSolicitudEquipo({
        liga_id: selectedLiga.id,
        nombre_equipo: formData.nombre_equipo.trim(),
        mensaje: formData.mensaje.trim() || undefined,
      }, user.id);

      toast.success('Solicitud enviada exitosamente');
      setShowForm(false);
      setSelectedLiga(null);
      await cargarDatos();
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      toast.error('Error al enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'aprobada':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobada
          </Badge>
        );
      case 'rechazada':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazada
          </Badge>
        );
      default:
        return null;
    }
  };

  const ligasFiltradas = ligas.filter(liga =>
    liga.nombre_liga.toLowerCase().includes(searchTerm.toLowerCase()) ||
    liga.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Excluir ligas donde ya tiene solicitud pendiente o aprobada
  const ligasDisponibles = ligasFiltradas.filter(liga => {
    const tieneSolicitud = solicitudes.some(s => 
      s.liga_id === liga.id && (s.estado === 'pendiente' || s.estado === 'aprobada')
    );
    return !tieneSolicitud;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isCapitan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600">
              Esta sección es solo para capitánes de equipo. Contacta a un administrador para cambiar tu rol.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Unirse a una Liga</h1>
          <p className="text-gray-600 mt-2">
            Busca una liga disponible y envía una solicitud para unirte con tu equipo
          </p>
        </div>

        {/* Solicitudes existentes */}
        {solicitudes.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="w-5 h-5 mr-2" />
                Mis Solicitudes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {solicitudes.map((solicitud) => (
                  <div
                    key={solicitud.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{solicitud.nombre_equipo}</h3>
                        {getEstadoBadge(solicitud.estado)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Liga: {solicitud.liga?.nombre_liga || 'Desconocida'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Enviada: {new Date(solicitud.created_at).toLocaleDateString('es-MX')}
                      </p>
                      {solicitud.respuesta_admin && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                          <strong>Respuesta:</strong> {solicitud.respuesta_admin}
                        </p>
                      )}
                    </div>
                    {solicitud.estado === 'aprobada' && solicitud.equipo && (
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Equipo Creado
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Buscador de ligas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Ligas Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por nombre de liga..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {ligasDisponibles.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'No se encontraron ligas con ese nombre'
                    : 'No hay ligas disponibles para unirse en este momento'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ligasDisponibles.map((liga) => (
                  <div
                    key={liga.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{liga.nombre_liga}</h3>
                        <p className="text-sm text-gray-500">/{liga.slug}</p>
                      </div>
                      <Badge variant={liga.plan === 'Oro' ? 'default' : liga.plan === 'Plata' ? 'secondary' : 'outline'}>
                        {liga.plan}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {liga.descripcion || 'Sin descripción'}
                    </p>
                    <Button 
                      onClick={() => handleSolicitar(liga)}
                      className="w-full"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Solicitar Unirme
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de solicitud */}
      {showForm && selectedLiga && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Solicitar Unirme a {selectedLiga.nombre_liga}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nombre_equipo">
                    Nombre de tu Equipo *
                  </Label>
                  <Input
                    id="nombre_equipo"
                    value={formData.nombre_equipo}
                    onChange={(e) => setFormData({ ...formData, nombre_equipo: e.target.value })}
                    placeholder="Ej: Los Tigres FC"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mensaje">
                    Mensaje al Administrador (opcional)
                  </Label>
                  <textarea
                    id="mensaje"
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    placeholder="Presenta tu equipo y cuéntale al administrador por qué quieres unirte..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Solicitud
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedLiga(null);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
