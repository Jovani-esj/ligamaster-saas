'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, CheckCircle, XCircle, Clock, Shield, Crown, Users } from 'lucide-react';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { InvitacionCapitanConDetalles } from '@/types/database';
import { getInvitacionesPorEmail, aceptarInvitacionCapitan, rechazarInvitacionCapitan } from '@/lib/database';

export default function MisInvitacionesPage() {
  const { user, profile } = useSimpleAuth();
  const [invitaciones, setInvitaciones] = useState<InvitacionCapitanConDetalles[]>([]);
  const [loading, setLoading] = useState(true);
  const [aceptandoId, setAceptandoId] = useState<string | null>(null);
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [respuestaRechazo, setRespuestaRechazo] = useState('');
  const [invitacionSeleccionada, setInvitacionSeleccionada] = useState<InvitacionCapitanConDetalles | null>(null);

  const cargarInvitaciones = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getInvitacionesPorEmail(user.email);
      setInvitaciones(data);
    } catch (error) {
      console.error('Error cargando invitaciones:', error);
      toast.error('Error al cargar las invitaciones');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user) {
      cargarInvitaciones();
    }
  }, [user, cargarInvitaciones]);

  const handleAceptar = async (invitacion: InvitacionCapitanConDetalles) => {
    if (!user?.id) return;
    
    setInvitacionSeleccionada(invitacion);
    setNombreEquipo(invitacion.nombre_equipo || '');
    setAceptandoId(invitacion.id);
  };

  const confirmarAceptar = async () => {
    if (!aceptandoId || !invitacionSeleccionada || !user?.id) return;

    try {
      const nombreFinal = nombreEquipo.trim() || invitacionSeleccionada.nombre_equipo || 'Mi Equipo';
      await aceptarInvitacionCapitan(aceptandoId, invitacionSeleccionada.token, user.id, nombreFinal);
      toast.success('¡Invitación aceptada! Ahora eres capitán de la liga.');
      setAceptandoId(null);
      setInvitacionSeleccionada(null);
      setNombreEquipo('');
      await cargarInvitaciones();
    } catch (error) {
      console.error('Error aceptando invitación:', error);
      toast.error(error instanceof Error ? error.message : 'Error al aceptar la invitación');
    }
  };

  const handleRechazar = async (invitacion: InvitacionCapitanConDetalles) => {
    setInvitacionSeleccionada(invitacion);
    setRechazandoId(invitacion.id);
    setRespuestaRechazo('');
  };

  const confirmarRechazar = async () => {
    if (!rechazandoId) return;

    try {
      await rechazarInvitacionCapitan(rechazandoId, respuestaRechazo);
      toast.success('Invitación rechazada');
      setRechazandoId(null);
      setInvitacionSeleccionada(null);
      setRespuestaRechazo('');
      await cargarInvitaciones();
    } catch (error) {
      console.error('Error rechazando invitación:', error);
      toast.error('Error al rechazar la invitación');
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'aceptada':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Aceptada</Badge>;
      case 'rechazada':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rechazada</Badge>;
      case 'expirada':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><Clock className="w-3 h-3 mr-1" />Expirada</Badge>;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inicia Sesión</h1>
          <p className="text-gray-600">Debes iniciar sesión para ver tus invitaciones.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Mail className="w-8 h-8 mr-3 text-blue-600" />
            Mis Invitaciones
          </h1>
          <p className="text-gray-600 mt-2">
            Aquí puedes ver las invitaciones que has recibido para unirte como capitán a ligas
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando invitaciones...</p>
          </div>
        ) : invitaciones.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes invitaciones</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                No has recibido invitaciones para ser capitán de ninguna liga. 
                Puedes buscar ligas y enviar solicitudes desde el dashboard.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invitaciones.map((invitacion) => (
              <Card key={invitacion.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-100 rounded-lg p-2">
                          <Crown className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            Invitación a {invitacion.liga?.nombre_liga || 'Liga'}
                          </h3>
                          {getEstadoBadge(invitacion.estado)}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 ml-12">
                        {invitacion.nombre_equipo && (
                          <p className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <strong>Equipo propuesto:</strong> {invitacion.nombre_equipo}
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <strong>Enviada:</strong> {new Date(invitacion.created_at).toLocaleDateString('es-MX', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        {invitacion.fecha_expiracion && invitacion.estado === 'pendiente' && (
                          <p className="flex items-center gap-2 text-orange-600">
                            <Clock className="w-4 h-4" />
                            <strong>Expira:</strong> {new Date(invitacion.fecha_expiracion).toLocaleDateString('es-MX')}
                          </p>
                        )}
                        {invitacion.mensaje && (
                          <div className="bg-gray-50 p-3 rounded-lg mt-3">
                            <p className="text-gray-700"><strong>Mensaje de la liga:</strong></p>
                            <p className="text-gray-600 italic">{invitacion.mensaje}</p>
                          </div>
                        )}
                        {invitacion.respuesta && (
                          <div className="bg-red-50 p-3 rounded-lg mt-3">
                            <p className="text-red-700"><strong>Tu respuesta:</strong> {invitacion.respuesta}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    {invitacion.estado === 'pendiente' && (
                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAceptar(invitacion)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aceptar
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleRechazar(invitacion)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para aceptar */}
        <Dialog open={!!aceptandoId} onOpenChange={(open) => !open && setAceptandoId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Aceptar Invitación
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-gray-600">
                Estás aceptando ser capitán de <strong>{invitacionSeleccionada?.liga?.nombre_liga}</strong>.
              </p>
              <div>
                <Label htmlFor="nombre-equipo">Nombre de tu equipo *</Label>
                <Input 
                  id="nombre-equipo" 
                  value={nombreEquipo} 
                  onChange={(e) => setNombreEquipo(e.target.value)}
                  placeholder="Ej: Los Tigres"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puedes cambiar el nombre propuesto por la liga
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setAceptandoId(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700" 
                  onClick={confirmarAceptar}
                  disabled={!nombreEquipo.trim()}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para rechazar */}
        <Dialog open={!!rechazandoId} onOpenChange={(open) => !open && setRechazandoId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Rechazar Invitación
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-gray-600">
                ¿Estás seguro de rechazar la invitación a <strong>{invitacionSeleccionada?.liga?.nombre_liga}</strong>?
              </p>
              <div>
                <Label htmlFor="respuesta">Motivo del rechazo (opcional)</Label>
                <Input 
                  id="respuesta" 
                  value={respuestaRechazo} 
                  onChange={(e) => setRespuestaRechazo(e.target.value)}
                  placeholder="Explica por qué rechazas..."
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setRechazandoId(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1" 
                  onClick={confirmarRechazar}
                >
                  Rechazar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
