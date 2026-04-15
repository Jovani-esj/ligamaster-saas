'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Equipo, 
  CreateEquipoData, 
  Jugador,
  EstadisticasEquipo,
  PERMISOS_POR_ROL 
} from '@/types/database';
import { 
  getEquipos, 
  getEquipo, 
  createEquipo, 
  updateEquipo, 
  deleteEquipo,
  getJugadores,
  getEstadisticasEquipo 
} from '@/lib/database';
import { useAuth } from '@/components/auth/AuthenticationSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Users, Settings, User, Palette } from 'lucide-react';

interface EquipoManagerProps {
  ligaId: string;
}

export default function EquipoManager({ ligaId }: EquipoManagerProps) {
  const { profile } = useAuth();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
  const [jugadoresPorEquipo, setJugadoresPorEquipo] = useState<Record<string, Jugador[]>>({});
  const [estadisticas, setEstadisticas] = useState<Record<string, EstadisticasEquipo>>({});
  const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({});

  // Form data
  const [formData, setFormData] = useState<CreateEquipoData>({
    nombre: '',
    logo_url: '',
    color_primario: '#000000',
    color_secundario: '#FFFFFF'
  });

  // Verificar permisos
  const permisos = profile ? PERMISOS_POR_ROL[profile.rol] : null;
  const puedeVerEquipos = permisos?.puede_ver_equipos || false;
  const puedeCrearEquipos = permisos?.puede_crear_equipos || false;
  const puedeEditarEquipos = permisos?.puede_editar_equipos || false;
  const puedeEliminarEquipos = permisos?.puede_eliminar_equipos || false;

  const fetchEquipos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEquipos(ligaId);
      setEquipos(data);
    } catch (error) {
      console.error('Error fetching equipos:', error);
      toast.error('Error al cargar los equipos');
    } finally {
      setLoading(false);
    }
  }, [ligaId]);

  useEffect(() => {
    if (puedeVerEquipos && ligaId) {
      fetchEquipos();
    }
  }, [puedeVerEquipos, ligaId, fetchEquipos]);

  const fetchJugadores = async (equipoId: string) => {
    try {
      const jugadores = await getJugadores(equipoId);
      setJugadoresPorEquipo(prev => ({ ...prev, [equipoId]: jugadores }));
    } catch (error) {
      console.error('Error fetching jugadores:', error);
    }
  };

  const fetchEstadisticas = async (equipoId: string) => {
    try {
      setLoadingStats(prev => ({ ...prev, [equipoId]: true }));
      const stats = await getEstadisticasEquipo(equipoId);
      setEstadisticas(prev => ({ ...prev, [equipoId]: stats }));
    } catch (error) {
      console.error('Error fetching estadísticas:', error);
    } finally {
      setLoadingStats(prev => ({ ...prev, [equipoId]: false }));
    }
  };

  const handleCreateEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeCrearEquipos) return;

    try {
      await createEquipo(formData, ligaId);
      toast.success('Equipo creado correctamente');
      setShowCreateDialog(false);
      setFormData({ nombre: '', logo_url: '', color_primario: '#000000', color_secundario: '#FFFFFF' });
      fetchEquipos();
    } catch (error) {
      console.error('Error creating equipo:', error);
      toast.error('Error al crear el equipo');
    }
  };

  const handleUpdateEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipo || !puedeEditarEquipos) return;

    try {
      await updateEquipo(selectedEquipo.id, formData);
      toast.success('Equipo actualizado correctamente');
      setShowEditDialog(false);
      setSelectedEquipo(null);
      setFormData({ nombre: '', logo_url: '', color_primario: '#000000', color_secundario: '#FFFFFF' });
      fetchEquipos();
    } catch (error) {
      console.error('Error updating equipo:', error);
      toast.error('Error al actualizar el equipo');
    }
  };

  const handleDeleteEquipo = async (equipoId: string) => {
    if (!puedeEliminarEquipos) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este equipo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteEquipo(equipoId);
      toast.success('Equipo eliminado correctamente');
      fetchEquipos();
    } catch (error) {
      console.error('Error deleting equipo:', error);
      toast.error('Error al eliminar el equipo');
    }
  };

  const openEditDialog = (equipo: Equipo) => {
    setSelectedEquipo(equipo);
    setFormData({
      nombre: equipo.nombre,
      logo_url: equipo.logo_url || '',
      color_primario: equipo.color_primario,
      color_secundario: equipo.color_secundario
    });
    setShowEditDialog(true);
  };

  if (!puedeVerEquipos) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-600">No tienes permisos para ver los equipos</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Equipos</h2>
        {puedeCrearEquipos && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Equipo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Equipo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEquipo} className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Equipo</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="logo_url">URL del Logo (opcional)</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="color_primario">Color Primario</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="color_primario"
                        type="color"
                        value={formData.color_primario}
                        onChange={(e) => setFormData(prev => ({ ...prev, color_primario: e.target.value }))}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.color_primario}
                        onChange={(e) => setFormData(prev => ({ ...prev, color_primario: e.target.value }))}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="color_secundario">Color Secundario</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="color_secundario"
                        type="color"
                        value={formData.color_secundario}
                        onChange={(e) => setFormData(prev => ({ ...prev, color_secundario: e.target.value }))}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.color_secundario}
                        onChange={(e) => setFormData(prev => ({ ...prev, color_secundario: e.target.value }))}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Equipo</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando equipos...</p>
        </div>
      ) : equipos.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-600">No hay equipos registrados</h3>
          {puedeCrearEquipos && (
            <p className="text-gray-500 mt-2">Crea tu primer equipo para comenzar</p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {equipos.map((equipo) => (
            <Card key={equipo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    {equipo.logo_url && (
                      <img 
                        src={equipo.logo_url} 
                        alt={equipo.nombre}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <CardTitle className="text-lg">{equipo.nombre}</CardTitle>
                      <div className="flex space-x-2 mt-1">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: equipo.color_primario }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: equipo.color_secundario }}
                        />
                      </div>
                    </div>
                  </div>
                  <Badge className={equipo.activo ? 'bg-green-500' : 'bg-red-500'}>
                    {equipo.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info" onClick={() => fetchJugadores(equipo.id)}>
                      <Eye className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="stats" onClick={() => fetchEstadisticas(equipo.id)}>
                      <Users className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="actions">
                      <Settings className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="mt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Creado:</span>
                        <span>{new Date(equipo.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jugadores:</span>
                        <span className="font-semibold">{jugadoresPorEquipo[equipo.id]?.length || 0}</span>
                      </div>
                      <div className="mt-3">
                        <span className="text-gray-600 text-sm">Jugadores:</span>
                        <div className="mt-1 space-y-1">
                          {jugadoresPorEquipo[equipo.id]?.slice(0, 3).map((jugador) => (
                            <div key={jugador.id} className="flex justify-between text-xs">
                              <span>{jugador.nombre} {jugador.apellido}</span>
                              <span className="text-gray-500">#{jugador.numero_camiseta}</span>
                            </div>
                          ))}
                          {(jugadoresPorEquipo[equipo.id]?.length || 0) > 3 && (
                            <div className="text-xs text-gray-500">
                              +{(jugadoresPorEquipo[equipo.id]?.length || 0) - 3} más
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="stats" className="mt-4">
                    {loadingStats[equipo.id] ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : estadisticas[equipo.id] ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Partidos J:</span>
                          <span className="font-semibold">{estadisticas[equipo.id].partidos_jugados}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ganados:</span>
                          <span className="font-semibold text-green-600">{estadisticas[equipo.id].partidos_ganados}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Empatados:</span>
                          <span className="font-semibold text-yellow-600">{estadisticas[equipo.id].partidos_empatados}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Perdidos:</span>
                          <span className="font-semibold text-red-600">{estadisticas[equipo.id].partidos_perdidos}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Puntos:</span>
                          <span className="font-bold">{estadisticas[equipo.id].puntos}</span>
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
                      {puedeEditarEquipos && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(equipo)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      )}
                      {puedeEliminarEquipos && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteEquipo(equipo.id)}
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
            <DialogTitle>Editar Equipo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateEquipo} className="space-y-4">
            <div>
              <Label htmlFor="edit_nombre">Nombre del Equipo</Label>
              <Input
                id="edit_nombre"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_logo_url">URL del Logo (opcional)</Label>
              <Input
                id="edit_logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_color_primario">Color Primario</Label>
                <div className="flex space-x-2">
                  <Input
                    id="edit_color_primario"
                    type="color"
                    value={formData.color_primario}
                    onChange={(e) => setFormData(prev => ({ ...prev, color_primario: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.color_primario}
                    onChange={(e) => setFormData(prev => ({ ...prev, color_primario: e.target.value }))}
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit_color_secundario">Color Secundario</Label>
                <div className="flex space-x-2">
                  <Input
                    id="edit_color_secundario"
                    type="color"
                    value={formData.color_secundario}
                    onChange={(e) => setFormData(prev => ({ ...prev, color_secundario: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.color_secundario}
                    onChange={(e) => setFormData(prev => ({ ...prev, color_secundario: e.target.value }))}
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar Equipo</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
