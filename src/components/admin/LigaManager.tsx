'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Liga, 
  CreateLigaData, 
  EstadisticasLiga,
  PERMISOS_POR_ROL 
} from '@/types/database';
import { 
  getLigas, 
  createLiga, 
  updateLiga, 
  deleteLiga,
  getEstadisticasLiga 
} from '@/lib/database';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Users, Settings } from 'lucide-react';

interface LigaManagerProps {
  userId?: string;
}

export default function LigaManager({ userId }: LigaManagerProps) {
  const { profile } = useSimpleAuth();
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedLiga, setSelectedLiga] = useState<Liga | null>(null);
  const [estadisticas, setEstadisticas] = useState<Record<string, EstadisticasLiga>>({});
  const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({});

  // Form data
  const [formData, setFormData] = useState<CreateLigaData>({
    nombre_liga: '',
    descripcion: '',
    plan: 'Bronce'
  });

  // Verificar permisos
  const permisos = profile ? PERMISOS_POR_ROL[profile.rol] : null;
  const puedeVerLigas = permisos?.puede_ver_ligas || false;
  const puedeCrearLigas = permisos?.puede_crear_ligas || false;
  const puedeEditarLigas = permisos?.puede_editar_ligas || false;
  const puedeEliminarLigas = permisos?.puede_eliminar_ligas || false;

  const fetchLigas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLigas(userId);
      setLigas(data);
    } catch (error) {
      console.error('Error fetching ligas:', error);
      toast.error('Error al cargar las ligas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (puedeVerLigas) {
      fetchLigas();
    }
  }, [puedeVerLigas, fetchLigas]);

  const fetchEstadisticas = async (ligaId: string) => {
    try {
      setLoadingStats(prev => ({ ...prev, [ligaId]: true }));
      const stats = await getEstadisticasLiga(ligaId);
      setEstadisticas(prev => ({ ...prev, [ligaId]: stats }));
    } catch (error) {
      console.error('Error fetching estadísticas:', error);
    } finally {
      setLoadingStats(prev => ({ ...prev, [ligaId]: false }));
    }
  };

  const handleCreateLiga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.user_id || !puedeCrearLigas) return;

    try {
      await createLiga(formData, profile.user_id);
      toast.success('Liga creada correctamente');
      setShowCreateDialog(false);
      setFormData({ nombre_liga: '', descripcion: '', plan: 'Bronce' });
      fetchLigas();
    } catch (error) {
      console.error('Error creating liga:', error);
      toast.error('Error al crear la liga');
    }
  };

  const handleUpdateLiga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLiga || !puedeEditarLigas) return;

    try {
      await updateLiga(selectedLiga.id, formData);
      toast.success('Liga actualizada correctamente');
      setShowEditDialog(false);
      setSelectedLiga(null);
      setFormData({ nombre_liga: '', descripcion: '', plan: 'Bronce' });
      fetchLigas();
    } catch (error) {
      console.error('Error updating liga:', error);
      toast.error('Error al actualizar la liga');
    }
  };

  const handleDeleteLiga = async (ligaId: string) => {
    if (!puedeEliminarLigas) return;

    if (!confirm('¿Estás seguro de que quieres eliminar esta liga? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteLiga(ligaId);
      toast.success('Liga eliminada correctamente');
      fetchLigas();
    } catch (error) {
      console.error('Error deleting liga:', error);
      toast.error('Error al eliminar la liga');
    }
  };

  const openEditDialog = (liga: Liga) => {
    setSelectedLiga(liga);
    setFormData({
      nombre_liga: liga.nombre_liga,
      descripcion: liga.descripcion,
      plan: liga.plan
    });
    setShowEditDialog(true);
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'Oro': return 'bg-yellow-500';
      case 'Plata': return 'bg-gray-500';
      case 'Bronce': return 'bg-orange-600';
      default: return 'bg-gray-500';
    }
  };

  const getEstadoBadgeColor = (activa: boolean, estatus_pago: boolean) => {
    if (!activa) return 'bg-red-500';
    if (!estatus_pago) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getEstadoText = (activa: boolean, estatus_pago: boolean) => {
    if (!activa) return 'Inactiva';
    if (!estatus_pago) return 'Pago Pendiente';
    return 'Activa';
  };

  if (!puedeVerLigas) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-600">No tienes permisos para ver las ligas</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Ligas</h2>
        {puedeCrearLigas && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Liga
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Liga</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateLiga} className="space-y-4">
                <div>
                  <Label htmlFor="nombre_liga">Nombre de la Liga</Label>
                  <Input
                    id="nombre_liga"
                    value={formData.nombre_liga}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre_liga: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="plan">Plan</Label>
                  <Select value={formData.plan} onValueChange={(value: 'Bronce' | 'Plata' | 'Oro') => setFormData(prev => ({ ...prev, plan: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bronce">Bronce</SelectItem>
                      <SelectItem value="Plata">Plata</SelectItem>
                      <SelectItem value="Oro">Oro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Liga</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando ligas...</p>
        </div>
      ) : ligas.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-600">No hay ligas registradas</h3>
          {puedeCrearLigas && (
            <p className="text-gray-500 mt-2">Crea tu primera liga para comenzar</p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ligas.map((liga) => (
            <Card key={liga.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{liga.nombre_liga}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{liga.descripcion}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Badge className={getPlanBadgeColor(liga.plan)}>
                      {liga.plan}
                    </Badge>
                    <Badge className={getEstadoBadgeColor(liga.activa, liga.estatus_pago)}>
                      {getEstadoText(liga.activa, liga.estatus_pago)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info" onClick={() => fetchEstadisticas(liga.id)}>
                      <Eye className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="stats">
                      <Users className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="actions">
                      <Settings className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="mt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Slug:</span>
                        <span className="font-mono">{liga.slug}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Creada:</span>
                        <span>{new Date(liga.fecha_registro).toLocaleDateString()}</span>
                      </div>
                      {liga.fecha_vencimiento && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vence:</span>
                          <span>{new Date(liga.fecha_vencimiento).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="stats" className="mt-4">
                    {loadingStats[liga.id] ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : estadisticas[liga.id] ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Equipos:</span>
                          <span className="font-semibold">{estadisticas[liga.id].total_equipos}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jugadores:</span>
                          <span className="font-semibold">{estadisticas[liga.id].total_jugadores}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Partidos:</span>
                          <span className="font-semibold">{estadisticas[liga.id].total_partidos}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jugados:</span>
                          <span className="font-semibold">{estadisticas[liga.id].partidos_jugados}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-gray-500">
                        Sin estadísticas
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="actions" className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {puedeEditarLigas && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(liga)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      )}
                      {puedeEliminarLigas && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteLiga(liga.id)}
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
            <DialogTitle>Editar Liga</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateLiga} className="space-y-4">
            <div>
              <Label htmlFor="edit_nombre_liga">Nombre de la Liga</Label>
              <Input
                id="edit_nombre_liga"
                value={formData.nombre_liga}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre_liga: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_descripcion">Descripción</Label>
              <Textarea
                id="edit_descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_plan">Plan</Label>
              <Select value={formData.plan} onValueChange={(value: 'Bronce' | 'Plata' | 'Oro') => setFormData(prev => ({ ...prev, plan: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bronce">Bronce</SelectItem>
                  <SelectItem value="Plata">Plata</SelectItem>
                  <SelectItem value="Oro">Oro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar Liga</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
