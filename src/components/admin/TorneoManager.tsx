'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Torneo, 
  CreateTorneoData,
  Partido,
  PERMISOS_POR_ROL 
} from '@/types/database';
import { 
  getTorneos, 
  getTorneo, 
  createTorneo, 
  updateTorneo, 
  deleteTorneo,
  getPartidos 
} from '@/lib/database';
import { useAuth } from '@/components/auth/AuthenticationSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Trophy, Settings, Calendar } from 'lucide-react';

interface TorneoManagerProps {
  ligaId: string;
  ligaNombre?: string;
}

export default function TorneoManager({ ligaId, ligaNombre }: TorneoManagerProps) {
  const { profile } = useAuth();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTorneo, setSelectedTorneo] = useState<Torneo | null>(null);
  const [partidosPorTorneo, setPartidosPorTorneo] = useState<Record<string, Partido[]>>({});

  // Form data
  const [formData, setFormData] = useState<CreateTorneoData>({
    nombre: ''
  });

  // Verificar permisos
  const permisos = profile ? PERMISOS_POR_ROL[profile.rol] : null;
  const puedeVerTorneos = permisos?.puede_ver_torneos || false;
  const puedeCrearTorneos = permisos?.puede_crear_torneos || false;
  const puedeEditarTorneos = permisos?.puede_editar_torneos || false;
  const puedeEliminarTorneos = permisos?.puede_eliminar_torneos || false;

  const fetchTorneos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTorneos(ligaId);
      setTorneos(data);
    } catch (error) {
      console.error('Error fetching torneos:', error);
      toast.error('Error al cargar los torneos');
    } finally {
      setLoading(false);
    }
  }, [ligaId]);

  useEffect(() => {
    if (puedeVerTorneos && ligaId) {
      fetchTorneos();
    }
  }, [puedeVerTorneos, ligaId, fetchTorneos]);

  const fetchPartidos = async (torneoId: string) => {
    try {
      const partidos = await getPartidos(torneoId);
      setPartidosPorTorneo(prev => ({ ...prev, [torneoId]: partidos }));
    } catch (error) {
      console.error('Error fetching partidos:', error);
    }
  };

  const handleCreateTorneo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeCrearTorneos) return;

    try {
      await createTorneo(formData, ligaId);
      toast.success('Torneo creado correctamente');
      setShowCreateDialog(false);
      setFormData({ nombre: '' });
      fetchTorneos();
    } catch (error) {
      console.error('Error creating torneo:', error);
      toast.error('Error al crear el torneo');
    }
  };

  const handleUpdateTorneo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTorneo || !puedeEditarTorneos) return;

    try {
      await updateTorneo(selectedTorneo.id, formData);
      toast.success('Torneo actualizado correctamente');
      setShowEditDialog(false);
      setSelectedTorneo(null);
      setFormData({ nombre: '' });
      fetchTorneos();
    } catch (error) {
      console.error('Error updating torneo:', error);
      toast.error('Error al actualizar el torneo');
    }
  };

  const handleDeleteTorneo = async (torneoId: string) => {
    if (!puedeEliminarTorneos) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este torneo? Esta acción no se puede deshacer y eliminará todos los partidos asociados.')) {
      return;
    }

    try {
      await deleteTorneo(torneoId);
      toast.success('Torneo eliminado correctamente');
      fetchTorneos();
    } catch (error) {
      console.error('Error deleting torneo:', error);
      toast.error('Error al eliminar el torneo');
    }
  };

  const openEditDialog = (torneo: Torneo) => {
    setSelectedTorneo(torneo);
    setFormData({
      nombre: torneo.nombre
    });
    setShowEditDialog(true);
  };

  const getEstadoBadgeColor = (activo: boolean) => {
    return activo ? 'bg-green-500' : 'bg-red-500';
  };

  const getEstadoText = (activo: boolean) => {
    return activo ? 'Activo' : 'Inactivo';
  };

  const getPartidosStats = (partidos: Partido[]) => {
    const total = partidos.length;
    const jugados = partidos.filter(p => p.estado === 'jugado').length;
    const programados = partidos.filter(p => p.estado === 'programado').length;
    const cancelados = partidos.filter(p => p.estado === 'cancelado').length;

    return { total, jugados, programados, cancelados };
  };

  if (!puedeVerTorneos) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-600">No tienes permisos para ver los torneos</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Torneos</h2>
          {ligaNombre && (
            <p className="text-gray-600 mt-1">Liga: {ligaNombre}</p>
          )}
        </div>
        {puedeCrearTorneos && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Torneo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Torneo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTorneo} className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Torneo</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Temporada 2024, Copa Primavera, etc."
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Torneo</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando torneos...</p>
        </div>
      ) : torneos.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-600">No hay torneos registrados</h3>
          {puedeCrearTorneos && (
            <p className="text-gray-500 mt-2">Crea tu primer torneo para comenzar</p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {torneos.map((torneo) => (
            <Card key={torneo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{torneo.nombre}</CardTitle>
                    </div>
                  </div>
                  <Badge className={getEstadoBadgeColor(torneo.activo)}>
                    {getEstadoText(torneo.activo)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info" onClick={() => fetchPartidos(torneo.id)}>
                      <Eye className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="partidos">
                      <Calendar className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="actions">
                      <Settings className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="mt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className={torneo.activo ? 'text-green-600' : 'text-red-600'}>
                          {getEstadoText(torneo.activo)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Partidos:</span>
                        <span className="font-semibold">{partidosPorTorneo[torneo.id]?.length || 0}</span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="partidos" className="mt-4">
                    {partidosPorTorneo[torneo.id] ? (
                      <div className="space-y-2">
                        {(() => {
                          const stats = getPartidosStats(partidosPorTorneo[torneo.id]!);
                          return (
                            <>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total:</span>
                                  <span className="font-semibold">{stats.total}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Jugados:</span>
                                  <span className="font-semibold text-green-600">{stats.jugados}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Programados:</span>
                                  <span className="font-semibold text-blue-600">{stats.programados}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Cancelados:</span>
                                  <span className="font-semibold text-red-600">{stats.cancelados}</span>
                                </div>
                              </div>
                              {partidosPorTorneo[torneo.id]!.slice(0, 3).map((partido) => (
                                <div key={partido.id} className="text-xs p-2 bg-gray-50 rounded">
                                  <div className="flex justify-between">
                                    <span className="font-medium">
                                      {partido.equipo_local_id || 'TBD'} vs {partido.equipo_visitante_id || 'TBD'}
                                    </span>
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs"
                                    >
                                      {partido.estado}
                                    </Badge>
                                  </div>
                                  {partido.fecha_jornada && (
                                    <div className="text-gray-500 mt-1">
                                      {new Date(partido.fecha_jornada).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {(partidosPorTorneo[torneo.id]!.length || 0) > 3 && (
                                <div className="text-xs text-gray-500 text-center">
                                  +{partidosPorTorneo[torneo.id]!.length - 3} partidos más
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-gray-500">
                        Sin partidos
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="actions" className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {puedeEditarTorneos && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(torneo)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      )}
                      {puedeEliminarTorneos && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteTorneo(torneo.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Torneo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTorneo} className="space-y-4">
            <div>
              <Label htmlFor="edit_nombre">Nombre del Torneo</Label>
              <Input
                id="edit_nombre"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar Torneo</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
