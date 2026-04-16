'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, Users, Shield, Filter, UserPlus, Mail, Crown, Search, Trash2, RefreshCw } from 'lucide-react';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Liga, SolicitudEquipoConDetalles, UserProfile, InvitacionCapitanConDetalles, CreateInvitacionCapitanData } from '@/types/database';
import {
  getSolicitudesPorLiga,
  aprobarSolicitudEquipo,
  rechazarSolicitudEquipo,
  getCapitanesPorLiga,
  crearInvitacionCapitan,
  getInvitacionesPorLiga,
  cancelarInvitacionCapitan,
  crearCapitanDirecto,
  revocarCapitan,
  getCapitanesSinLiga,
  asignarCapitanALiga
} from '@/lib/database';
import { supabase } from '@/lib/supabase';

export default function AprobacionesPage() {
  const { user, profile } = useSimpleAuth();
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [selectedLigaId, setSelectedLigaId] = useState<string>('');
  const [solicitudes, setSolicitudes] = useState<SolicitudEquipoConDetalles[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'pendiente' | 'aprobada' | 'rechazada'>('todas');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);
  const [rechazoMensaje, setRechazoMensaje] = useState('');

  // Estados para gestión de capitanes
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [capitanesSinLiga, setCapitanesSinLiga] = useState<Array<{id: string, nombre: string, apellido?: string | null, email: string}>>([]);
  const [loadingCapitanesSinLiga, setLoadingCapitanesSinLiga] = useState(false);
  const [capitanes, setCapitanes] = useState<Array<{id: string, nombre: string, apellido: string | null, email: string, telefono: string | null, equipo: {id: string, nombre: string, logo_url: string | null, activo: boolean} | null}>>([]);
  const [invitaciones, setInvitaciones] = useState<InvitacionCapitanConDetalles[]>([]);
  const [loadingCapitanes, setLoadingCapitanes] = useState(false);
  const [loadingInvitaciones, setLoadingInvitaciones] = useState(false);

  // Estados para formularios
  const [showInvitarDialog, setShowInvitarDialog] = useState(false);
  const [showCrearCapitanDialog, setShowCrearCapitanDialog] = useState(false);
  const [invitacionForm, setInvitacionForm] = useState<Partial<CreateInvitacionCapitanData>>({
    email: '',
    nombre: '',
    nombre_equipo: '',
    mensaje: '',
  });
  const [crearCapitanForm, setCrearCapitanForm] = useState({
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    nombre_equipo: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const isAdminLiga = profile?.rol === 'admin_liga';
  const isAdminAdmin = profile?.rol === 'adminadmin' || profile?.rol === 'superadmin';

  // Cargar ligas del administrador
  const cargarLigas = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('ligas')
        .select('*')
        .eq('owner_id', user.id)
        .eq('activa', true);

      if (error) throw error;
      setLigas(data || []);
      
      // Si solo tiene una liga, seleccionarla automáticamente
      if (data && data.length === 1) {
        setSelectedLigaId(data[0].id);
      }
    } catch (error) {
      console.error('Error cargando ligas:', error);
    }
  }, [user?.id]);

  // Cargar solicitudes de la liga seleccionada
  const cargarSolicitudes = useCallback(async () => {
    if (!selectedLigaId) {
      setSolicitudes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getSolicitudesPorLiga(selectedLigaId);
      setSolicitudes(data);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      toast.error('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }, [selectedLigaId]);

  useEffect(() => {
    if (user && (isAdminLiga || isAdminAdmin)) {
      cargarLigas();
    }
  }, [user, isAdminLiga, isAdminAdmin, cargarLigas]);

  useEffect(() => {
    cargarSolicitudes();
  }, [selectedLigaId, cargarSolicitudes]);

  // Cargar capitanes de la liga
  const cargarCapitanes = useCallback(async () => {
    if (!selectedLigaId) {
      setCapitanes([]);
      return;
    }

    try {
      setLoadingCapitanes(true);
      console.log('Cargando capitanes para liga:', selectedLigaId);
      const data = await getCapitanesPorLiga(selectedLigaId);
      console.log('Capitanes cargados:', data);
      setCapitanes(data);
    } catch (error) {
      console.error('Error detallado cargando capitanes:', error);
      const errorMsg = (error as Error)?.message || JSON.stringify(error) || 'Error desconocido';
      toast.error(`Error al cargar los capitanes: ${errorMsg}`);
    } finally {
      setLoadingCapitanes(false);
    }
  }, [selectedLigaId]);

  // Cargar capitanes sin liga asignada
  const cargarCapitanesSinLigaFn = useCallback(async () => {
    try {
      setLoadingCapitanesSinLiga(true);
      const data = await getCapitanesSinLiga();
      setCapitanesSinLiga(data.map(c => ({
        id: c.id,
        nombre: c.nombre,
        apellido: c.apellido,
        email: c.email
      })));
    } catch (error) {
      console.error('Error cargando capitanes sin liga:', error);
    } finally {
      setLoadingCapitanesSinLiga(false);
    }
  }, []);

  // Asignar capitán sin liga a la liga actual
  const handleAsignarCapitan = async (capitanId: string) => {
    if (!selectedLigaId) {
      toast.error('Selecciona una liga primero');
      return;
    }
    try {
      await asignarCapitanALiga(capitanId, selectedLigaId);
      toast.success('Capitán asignado a la liga exitosamente');
      await cargarCapitanes();
      await cargarCapitanesSinLigaFn();
    } catch (error) {
      console.error('Error asignando capitán:', error);
      toast.error('Error al asignar el capitán a la liga');
    }
  };

  // Cargar invitaciones de la liga
  const cargarInvitaciones = useCallback(async () => {
    if (!selectedLigaId) {
      setInvitaciones([]);
      return;
    }

    try {
      setLoadingInvitaciones(true);
      const data = await getInvitacionesPorLiga(selectedLigaId);
      setInvitaciones(data);
    } catch (error) {
      console.error('Error cargando invitaciones:', error);
      toast.error('Error al cargar las invitaciones');
    } finally {
      setLoadingInvitaciones(false);
    }
  }, [selectedLigaId]);

  // Efecto para cargar datos según la pestaña activa
  useEffect(() => {
    if (selectedLigaId) {
      if (activeTab === 'capitanes') {
        cargarCapitanes();
        cargarCapitanesSinLigaFn();
      } else if (activeTab === 'invitaciones') {
        cargarInvitaciones();
      }
    }
  }, [activeTab, selectedLigaId, cargarCapitanes, cargarInvitaciones, cargarCapitanesSinLigaFn]);

  const handleAprobar = async (solicitudId: string) => {
    if (!selectedLigaId) return;
    
    setProcessingId(solicitudId);
    try {
      const { equipo } = await aprobarSolicitudEquipo(solicitudId, selectedLigaId);
      toast.success(`Solicitud aprobada. Equipo "${equipo.nombre}" creado exitosamente.`);
      await cargarSolicitudes();
    } catch (error) {
      console.error('Error aprobando solicitud:', error);
      toast.error('Error al aprobar la solicitud');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRechazar = async (solicitudId: string) => {
    if (!rechazoMensaje.trim()) {
      toast.error('Debes indicar el motivo del rechazo');
      return;
    }

    try {
      await rechazarSolicitudEquipo(solicitudId, rechazoMensaje);
      toast.success('Solicitud rechazada');
      setRechazandoId(null);
      setRechazoMensaje('');
      await cargarSolicitudes();
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      toast.error('Error al rechazar la solicitud');
    }
  };

  const solicitudesFiltradas = solicitudes.filter(s => 
    filter === 'todas' || s.estado === filter
  );

  const stats = {
    pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
    aprobadas: solicitudes.filter(s => s.estado === 'aprobada').length,
    rechazadas: solicitudes.filter(s => s.estado === 'rechazada').length,
    total: solicitudes.length,
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

  const getEstadoInvitacionBadge = (estado: string) => {
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

  // Handler para enviar invitación
  const handleEnviarInvitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLigaId) return;

    if (!invitacionForm.email || !invitacionForm.nombre || !invitacionForm.nombre_equipo) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setSubmitting(true);
    try {
      await crearInvitacionCapitan({
        ...invitacionForm,
        liga_id: selectedLigaId,
      } as CreateInvitacionCapitanData);
      toast.success('Invitación enviada exitosamente');
      setShowInvitarDialog(false);
      setInvitacionForm({ email: '', nombre: '', nombre_equipo: '', mensaje: '' });
      await cargarInvitaciones();
    } catch (error) {
      console.error('Error enviando invitación:', error);
      toast.error(error instanceof Error ? error.message : 'Error al enviar la invitación');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler para crear capitan directamente
  const handleCrearCapitan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLigaId) return;

    if (!crearCapitanForm.email || !crearCapitanForm.nombre || !crearCapitanForm.nombre_equipo) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setSubmitting(true);
    try {
      const { user, equipo } = await crearCapitanDirecto(selectedLigaId, {
        email: crearCapitanForm.email,
        nombre: crearCapitanForm.nombre,
        apellido: crearCapitanForm.apellido,
        telefono: crearCapitanForm.telefono || undefined,
        nombre_equipo: crearCapitanForm.nombre_equipo,
      });
      toast.success(`Capitán ${user.nombre} creado con equipo ${equipo.nombre}. Se envió email con contraseña temporal.`);
      setShowCrearCapitanDialog(false);
      setCrearCapitanForm({ email: '', nombre: '', apellido: '', telefono: '', nombre_equipo: '' });
      await cargarCapitanes();
    } catch (error) {
      console.error('Error creando capitán:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear el capitán');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler para cancelar invitación
  const handleCancelarInvitacion = async (invitacionId: string) => {
    try {
      await cancelarInvitacionCapitan(invitacionId);
      toast.success('Invitación cancelada');
      await cargarInvitaciones();
    } catch (error) {
      console.error('Error cancelando invitación:', error);
      toast.error('Error al cancelar la invitación');
    }
  };

  // Handler para revocar capitanía
  const handleRevocarCapitan = async (capitanId: string, mantenerEquipo: boolean = false) => {
    if (!confirm(`¿Estás seguro de revocar la capitanía? ${mantenerEquipo ? 'El usuario permanecerá en el equipo.' : 'El usuario será removido del equipo.'}`)) {
      return;
    }
    try {
      await revocarCapitan(capitanId, mantenerEquipo);
      toast.success('Capitanía revocada exitosamente');
      await cargarCapitanes();
    } catch (error) {
      console.error('Error revocando capitanía:', error);
      toast.error('Error al revocar la capitanía');
    }
  };

  if (!isAdminLiga && !isAdminAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600">
              Solo los administradores de liga pueden gestionar solicitudes.
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
          <h1 className="text-3xl font-bold text-gray-900">Panel de Aprobaciones</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las solicitudes de equipos que desean unirse a tus ligas
          </p>
        </div>

        {/* Selector de Liga */}
        {ligas.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seleccionar Liga
                  </label>
                  {ligas.length === 1 ? (
                    <p className="text-lg font-semibold">{ligas[0].nombre_liga}</p>
                  ) : (
                    <select
                      value={selectedLigaId}
                      onChange={(e) => setSelectedLigaId(e.target.value)}
                      className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecciona una liga</option>
                      {ligas.map((liga) => (
                        <option key={liga.id} value={liga.id}>
                          {liga.nombre_liga}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedLigaId ? (
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {ligas.length === 0 
                  ? 'No tienes ligas creadas. Crea una liga primero para recibir solicitudes.'
                  : 'Selecciona una liga para ver sus solicitudes'}
              </p>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
              <TabsTrigger value="solicitudes" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Solicitudes ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="invitar" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Invitar Capitanes
              </TabsTrigger>
              <TabsTrigger value="capitanes" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Capitanes ({capitanes.length})
              </TabsTrigger>
            </TabsList>

            {/* Tab: Solicitudes de Equipos */}
            <TabsContent value="solicitudes" className="space-y-6">
              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pendientes</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Aprobados</p>
                        <p className="text-2xl font-bold text-green-600">{stats.aprobadas}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Rechazados</p>
                        <p className="text-2xl font-bold text-red-600">{stats.rechazadas}</p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <div className="flex gap-2">
                  {(['todas', 'pendiente', 'aprobada', 'rechazada'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                        filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Solicitudes */}
              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes de Equipos</CardTitle>
                </CardHeader>
                <CardContent>
                  {solicitudesFiltradas.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {filter === 'todas' ? 'No hay solicitudes para esta liga' : `No hay solicitudes ${filter}s`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {solicitudesFiltradas.map((solicitud) => (
                        <div key={solicitud.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{solicitud.nombre_equipo}</h3>
                                {getEstadoBadge(solicitud.estado)}
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p><strong>Solicitante:</strong> {solicitud.capitan?.nombre || 'Desconocido'} {solicitud.capitan?.apellido || ''}</p>
                                <p><strong>Fecha:</strong> {new Date(solicitud.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                {solicitud.mensaje && <p className="bg-gray-50 p-2 rounded mt-2"><strong>Mensaje:</strong> {solicitud.mensaje}</p>}
                                {solicitud.respuesta_admin && (
                                  <p className={`p-2 rounded mt-2 ${solicitud.estado === 'rechazada' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                    <strong>Respuesta:</strong> {solicitud.respuesta_admin}
                                  </p>
                                )}
                              </div>
                            </div>
                            {solicitud.estado === 'pendiente' && (
                              <div className="flex flex-col gap-2 ml-4">
                                {rechazandoId === solicitud.id ? (
                                  <div className="space-y-2">
                                    <textarea value={rechazoMensaje} onChange={(e) => setRechazoMensaje(e.target.value)} placeholder="Motivo del rechazo..." className="w-48 px-2 py-1 text-sm border border-gray-300 rounded" />
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="destructive" onClick={() => handleRechazar(solicitud.id)}>Confirmar</Button>
                                      <Button size="sm" variant="outline" onClick={() => { setRechazandoId(null); setRechazoMensaje(''); }}>Cancelar</Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAprobar(solicitud.id)} disabled={processingId === solicitud.id}>
                                      {processingId === solicitud.id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><CheckCircle className="w-4 h-4 mr-1" />Aprobar</>}
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => setRechazandoId(solicitud.id)}>
                                      <XCircle className="w-4 h-4 mr-1" />Rechazar
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Invitar Capitanes */}
            <TabsContent value="invitar" className="space-y-6">
              <div className="flex justify-end gap-2">
                <Dialog open={showInvitarDialog} onOpenChange={setShowInvitarDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Invitación
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Invitar Capitán de Equipo</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEnviarInvitacion} className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="email">Email del Capitán *</Label>
                        <Input id="email" type="email" required value={invitacionForm.email} onChange={(e) => setInvitacionForm(prev => ({ ...prev, email: e.target.value }))} placeholder="capitan@ejemplo.com" />
                      </div>
                      <div>
                        <Label htmlFor="nombre">Nombre del Capitán *</Label>
                        <Input id="nombre" required value={invitacionForm.nombre} onChange={(e) => setInvitacionForm(prev => ({ ...prev, nombre: e.target.value }))} placeholder="Juan Pérez" />
                      </div>
                      <div>
                        <Label htmlFor="nombre_equipo">Nombre del Equipo *</Label>
                        <Input id="nombre_equipo" required value={invitacionForm.nombre_equipo} onChange={(e) => setInvitacionForm(prev => ({ ...prev, nombre_equipo: e.target.value }))} placeholder="Los Tigres" />
                      </div>
                      <div>
                        <Label htmlFor="mensaje">Mensaje (opcional)</Label>
                        <Input id="mensaje" value={invitacionForm.mensaje} onChange={(e) => setInvitacionForm(prev => ({ ...prev, mensaje: e.target.value }))} placeholder="Te invitamos a unirte a nuestra liga..." />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowInvitarDialog(false)} className="flex-1">Cancelar</Button>
                        <Button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
                          {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : 'Enviar Invitación'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={showCrearCapitanDialog} onOpenChange={setShowCrearCapitanDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crear Capitán Directo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Crear Capitán y Equipo</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCrearCapitan} className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="crear-email">Email *</Label>
                        <Input id="crear-email" type="email" required value={crearCapitanForm.email} onChange={(e) => setCrearCapitanForm(prev => ({ ...prev, email: e.target.value }))} placeholder="capitan@ejemplo.com" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="crear-nombre">Nombre *</Label>
                          <Input id="crear-nombre" required value={crearCapitanForm.nombre} onChange={(e) => setCrearCapitanForm(prev => ({ ...prev, nombre: e.target.value }))} placeholder="Juan" />
                        </div>
                        <div>
                          <Label htmlFor="crear-apellido">Apellido</Label>
                          <Input id="crear-apellido" value={crearCapitanForm.apellido} onChange={(e) => setCrearCapitanForm(prev => ({ ...prev, apellido: e.target.value }))} placeholder="Pérez" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="crear-telefono">Teléfono</Label>
                        <Input id="crear-telefono" value={crearCapitanForm.telefono} onChange={(e) => setCrearCapitanForm(prev => ({ ...prev, telefono: e.target.value }))} placeholder="+52 123 456 7890" />
                      </div>
                      <div>
                        <Label htmlFor="crear-nombre-equipo">Nombre del Equipo *</Label>
                        <Input id="crear-nombre-equipo" required value={crearCapitanForm.nombre_equipo} onChange={(e) => setCrearCapitanForm(prev => ({ ...prev, nombre_equipo: e.target.value }))} placeholder="Los Tigres" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowCrearCapitanDialog(false)} className="flex-1">Cancelar</Button>
                        <Button type="submit" disabled={submitting} className="flex-1 bg-green-600 hover:bg-green-700">
                          {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : 'Crear Capitán'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Lista de Invitaciones Enviadas */}
              <Card>
                <CardHeader>
                  <CardTitle>Invitaciones Enviadas</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingInvitaciones ? (
                    <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
                  ) : invitaciones.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No has enviado invitaciones aún</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {invitaciones.map((inv) => (
                        <div key={inv.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{inv.nombre} ({inv.email})</h3>
                                {getEstadoInvitacionBadge(inv.estado)}
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p><strong>Equipo:</strong> {inv.nombre_equipo}</p>
                                <p><strong>Enviada:</strong> {new Date(inv.created_at).toLocaleDateString('es-MX')}</p>
                                {inv.fecha_expiracion && <p><strong>Expira:</strong> {new Date(inv.fecha_expiracion).toLocaleDateString('es-MX')}</p>}
                                {inv.mensaje && <p className="bg-gray-50 p-2 rounded mt-2"><strong>Mensaje:</strong> {inv.mensaje}</p>}
                                {inv.respuesta && <p className="bg-red-50 text-red-700 p-2 rounded mt-2"><strong>Respuesta:</strong> {inv.respuesta}</p>}
                              </div>
                            </div>
                            {inv.estado === 'pendiente' && (
                              <Button size="sm" variant="destructive" onClick={() => handleCancelarInvitacion(inv.id)}>
                                <Trash2 className="w-4 h-4 mr-1" />Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Capitanes Existentes */}
            <TabsContent value="capitanes" className="space-y-6">
              <div className="flex justify-end">
                <Button variant="outline" onClick={cargarCapitanes}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Capitanes de la Liga</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingCapitanes ? (
                    <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
                  ) : capitanes.length === 0 ? (
                    <div className="text-center py-8">
                      <Crown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay capitanes registrados en esta liga</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {capitanes.map((capitan) => (
                        <div key={capitan.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{capitan.nombre} {capitan.apellido}</h3>
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Crown className="w-3 h-3 mr-1" />Capitán</Badge>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p><strong>Email:</strong> {capitan.email}</p>
                                {capitan.telefono && <p><strong>Teléfono:</strong> {capitan.telefono}</p>}
                                {capitan.equipo && (
                                  <p className="flex items-center gap-2">
                                    <strong>Equipo:</strong>
                                    <span className="font-medium">{capitan.equipo.nombre}</span>
                                    <Badge className={capitan.equipo.activo ? 'bg-green-500' : 'bg-red-500'}>
                                      {capitan.equipo.activo ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <Button size="sm" variant="outline" onClick={() => handleRevocarCapitan(capitan.id, true)}>
                                <Crown className="w-4 h-4 mr-1" />Quitar Capitanía
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRevocarCapitan(capitan.id, false)}>
                                <Trash2 className="w-4 h-4 mr-1" />Remover del Equipo
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Capitanes sin liga - para asignar */}
              {capitanesSinLiga.length > 0 && (
                <Card className="border-orange-200">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="text-orange-800 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Capitanes sin Liga Asignada ({capitanesSinLiga.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {loadingCapitanesSinLiga ? (
                      <div className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div></div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 mb-3">
                          Estos capitanes tienen rol de capitán pero no están asignados a ninguna liga. 
                          Puedes asignarlos a esta liga.
                        </p>
                        {capitanesSinLiga.map((capitan) => (
                          <div key={capitan.id} className="flex items-center justify-between border rounded-lg p-3 bg-white">
                            <div>
                              <p className="font-medium">{capitan.nombre} {capitan.apellido}</p>
                              <p className="text-sm text-gray-500">{capitan.email}</p>
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-orange-600 hover:bg-orange-700"
                              onClick={() => handleAsignarCapitan(capitan.id)}
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Asignar a esta Liga
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
