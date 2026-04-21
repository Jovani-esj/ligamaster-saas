'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Cancha, 
  CreateCanchaData,
  PERMISOS_POR_ROL 
} from '@/types/database';
import { 
  getCanchas, 
  getCancha, 
  createCancha, 
  updateCancha, 
  deleteCancha 
} from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Eye, MapPin, Settings, DollarSign, Users, Lightbulb } from 'lucide-react';

interface CanchaManagerProps {
  ligaId: string;
  ligaNombre?: string;
}

const TIPOS_CANCHA = [
  'futbol',
  'futbol_7',
  'futbol_8',
  'futbol_11',
  'futsal'
];

const SUPERFICIES = [
  'natural',
  'sintetico',
  'cemento',
  'parquet',
  'moqueta'
];

export default function CanchaManager({ ligaId, ligaNombre }: CanchaManagerProps) {
  const { profile } = useSimpleAuth();
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCancha, setSelectedCancha] = useState<Cancha | null>(null);
  const [misLigas, setMisLigas] = useState<{id: string, nombre_liga: string}[]>([]);

  // Form data
  const [formData, setFormData] = useState<CreateCanchaData>({
    nombre: '',
    direccion: '',
    tipo: 'futbol',
    superficie: 'natural',
    capacidad_espectadores: 0,
    tiene_iluminacion: false,
    tiene_vestuarios: false,
    precio_hora: 0,
    liga_ids: [ligaId]
  });

  // Verificar permisos
  const permisos = profile ? PERMISOS_POR_ROL[profile.rol] : null;
  const puedeVerCanchas = permisos?.puede_ver_canchas || false;
  const puedeCrearCanchas = permisos?.puede_crear_canchas || false;
  const puedeEditarCanchas = permisos?.puede_editar_canchas || false;
  const puedeEliminarCanchas = permisos?.puede_eliminar_canchas || false;

  const fetchCanchas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCanchas(ligaId);
      setCanchas(data);
    } catch (error) {
      console.error('Error fetching canchas:', error);
      toast.error('Error al cargar las canchas');
    } finally {
      setLoading(false);
    }
  }, [ligaId]);

  useEffect(() => {
    if (puedeVerCanchas && ligaId) {
      fetchCanchas();
    }
  }, [puedeVerCanchas, ligaId, fetchCanchas]);

  useEffect(() => {
    const fetchMisLigas = async () => {
      if (profile?.id) {
        const { data } = await supabase.from('ligas').select('id, nombre_liga').eq('owner_id', profile.id);
        if (data) setMisLigas(data);
      }
    };
    if (puedeCrearCanchas || puedeEditarCanchas) {
      fetchMisLigas();
    }
  }, [profile?.id, puedeCrearCanchas, puedeEditarCanchas]);

  const handleCreateCancha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeCrearCanchas) return;

    try {
      await createCancha(formData, ligaId);
      toast.success('Cancha creada correctamente');
      setShowCreateDialog(false);
      resetForm();
      fetchCanchas();
    } catch (error) {
      console.error('Error creating cancha:', error);
      toast.error('Error al crear la cancha');
    }
  };

  const handleUpdateCancha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCancha || !puedeEditarCanchas) return;

    try {
      await updateCancha(selectedCancha.id, formData);
      toast.success('Cancha actualizada correctamente');
      setShowEditDialog(false);
      setSelectedCancha(null);
      resetForm();
      fetchCanchas();
    } catch (error) {
      console.error('Error updating cancha:', error);
      toast.error('Error al actualizar la cancha');
    }
  };

  const handleDeleteCancha = async (canchaId: string) => {
    if (!puedeEliminarCanchas) return;

    if (!confirm('¿Estás seguro de que quieres eliminar esta cancha? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteCancha(canchaId);
      toast.success('Cancha eliminada correctamente');
      fetchCanchas();
    } catch (error) {
      console.error('Error deleting cancha:', error);
      toast.error('Error al eliminar la cancha');
    }
  };

  const openEditDialog = (cancha: Cancha) => {
    setSelectedCancha(cancha);
    setFormData({
      nombre: cancha.nombre,
      direccion: cancha.direccion || '',
      tipo: cancha.tipo,
      superficie: cancha.superficie,
      capacidad_espectadores: cancha.capacidad_espectadores,
      tiene_iluminacion: cancha.tiene_iluminacion,
      tiene_vestuarios: cancha.tiene_vestuarios,
      precio_hora: cancha.precio_hora,
      liga_ids: (cancha as any).liga_ids || [ligaId]
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      tipo: 'futbol',
      superficie: 'natural',
      capacidad_espectadores: 0,
      tiene_iluminacion: false,
      tiene_vestuarios: false,
      precio_hora: 0,
      liga_ids: [ligaId]
    });
  };

  const getTipoDisplay = (tipo: string) => {
    switch (tipo) {
      case 'futbol': return 'Fútbol 11';
      case 'futbol_7': return 'Fútbol 7';
      case 'futbol_8': return 'Fútbol 8';
      case 'futsal': return 'Futsal';
      default: return tipo;
    }
  };

  const getSuperficieDisplay = (superficie: string) => {
    switch (superficie) {
      case 'natural': return 'Césped Natural';
      case 'sintetico': return 'Césped Sintético';
      case 'cemento': return 'Cemento';
      case 'parquet': return 'Parquet';
      case 'moqueta': return 'Moqueta';
      default: return superficie;
    }
  };

  const getEstadoBadgeColor = (activa: boolean) => {
    return activa ? 'bg-green-500' : 'bg-red-500';
  };

  const getEstadoText = (activa: boolean) => {
    return activa ? 'Activa' : 'Inactiva';
  };

  if (!puedeVerCanchas) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-600">No tienes permisos para ver las canchas</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Canchas</h2>
          {ligaNombre && (
            <p className="text-gray-600 mt-1">Liga: {ligaNombre}</p>
          )}
        </div>
        {puedeCrearCanchas && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Cancha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Cancha</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCancha} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre de la Cancha *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Ej: Cancha Principal, Cancha Secundaria"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo de Cancha</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_CANCHA.map(tipo => (
                          <SelectItem key={tipo} value={tipo}>
                            {getTipoDisplay(tipo)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                    placeholder="Ej: Av. Principal #123, Ciudad de Ejemplo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="superficie">Superficie</Label>
                    <Select value={formData.superficie} onValueChange={(value) => setFormData(prev => ({ ...prev, superficie: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPERFICIES.map(superficie => (
                          <SelectItem key={superficie} value={superficie}>
                            {getSuperficieDisplay(superficie)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capacidad_espectadores">Capacidad de Espectadores</Label>
                    <Input
                      id="capacidad_espectadores"
                      type="number"
                      min="0"
                      value={formData.capacidad_espectadores}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacidad_espectadores: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="precio_hora">Precio por Hora</Label>
                  <Input
                    id="precio_hora"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio_hora}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio_hora: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="tiene_iluminacion"
                      checked={formData.tiene_iluminacion}
                      onChange={(e) => setFormData(prev => ({ ...prev, tiene_iluminacion: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="tiene_iluminacion">Tiene Iluminación</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="tiene_vestuarios"
                      checked={formData.tiene_vestuarios}
                      onChange={(e) => setFormData(prev => ({ ...prev, tiene_vestuarios: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="tiene_vestuarios">Tiene Vestuarios</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Asignar a Ligas (Selecciona una o más)</Label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2 bg-gray-50">
                    {misLigas.length === 0 ? (
                      <p className="text-sm text-gray-500">Cargando tus ligas...</p>
                    ) : (
                      misLigas.map((liga) => (
                        <div key={liga.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`liga_create_${liga.id}`}
                            checked={formData.liga_ids?.includes(liga.id) || false}
                            onChange={(e) => {
                              const newIds = e.target.checked
                                ? [...(formData.liga_ids || []), liga.id]
                                : (formData.liga_ids || []).filter(id => id !== liga.id);
                              
                              if (newIds.length > 0) {
                                setFormData(prev => ({ ...prev, liga_ids: newIds }));
                              } else {
                                toast.error('Debe asignar la cancha al menos a una liga');
                              }
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={`liga_create_${liga.id}`} className="font-normal cursor-pointer">
                            {liga.nombre_liga}
                            {liga.id === ligaId && ' (Liga Actual)'}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Cancha</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando canchas...</p>
        </div>
      ) : canchas.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-600">No hay canchas registradas</h3>
          {puedeCrearCanchas && (
            <p className="text-gray-500 mt-2">Agrega canchas para poder programar partidos</p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {canchas.map((cancha) => (
            <Card key={cancha.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{cancha.nombre}</CardTitle>
                      <div className="flex items-center space-x-1 mt-1">
                        <Badge variant="outline">{getTipoDisplay(cancha.tipo)}</Badge>
                        <Badge variant="secondary">{getSuperficieDisplay(cancha.superficie)}</Badge>
                      </div>
                    </div>
                  </div>
                  <Badge className={getEstadoBadgeColor(cancha.activa)}>
                    {getEstadoText(cancha.activa)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">
                      <Eye className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="features">
                      <Settings className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="actions">
                      <Edit className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="mt-4">
                    <div className="space-y-2 text-sm">
                      {cancha.direccion && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <span className="text-gray-600">{cancha.direccion}</span>
                        </div>
                      )}
                      {cancha.capacidad_espectadores > 0 && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            Capacidad: {cancha.capacidad_espectadores} espectadores
                          </span>
                        </div>
                      )}
                      {cancha.precio_hora > 0 && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            ${cancha.precio_hora.toFixed(2)} por hora
                          </span>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="features" className="mt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4 text-gray-500" />
                        <span className={cancha.tiene_iluminacion ? 'text-green-600' : 'text-gray-400'}>
                          {cancha.tiene_iluminacion ? 'Con iluminación' : 'Sin iluminación'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className={cancha.tiene_vestuarios ? 'text-green-600' : 'text-gray-400'}>
                          {cancha.tiene_vestuarios ? 'Con vestuarios' : 'Sin vestuarios'}
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="actions" className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {puedeEditarCanchas && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(cancha)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      )}
                      {puedeEliminarCanchas && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCancha(cancha.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cancha</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCancha} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_nombre">Nombre de la Cancha *</Label>
                <Input
                  id="edit_nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_tipo">Tipo de Cancha</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CANCHA.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>
                        {getTipoDisplay(tipo)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit_direccion">Dirección</Label>
              <Textarea
                id="edit_direccion"
                value={formData.direccion}
                onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_superficie">Superficie</Label>
                <Select value={formData.superficie} onValueChange={(value) => setFormData(prev => ({ ...prev, superficie: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPERFICIES.map(superficie => (
                      <SelectItem key={superficie} value={superficie}>
                        {getSuperficieDisplay(superficie)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_capacidad_espectadores">Capacidad de Espectadores</Label>
                <Input
                  id="edit_capacidad_espectadores"
                  type="number"
                  min="0"
                  value={formData.capacidad_espectadores}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacidad_espectadores: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_precio_hora">Precio por Hora</Label>
              <Input
                id="edit_precio_hora"
                type="number"
                min="0"
                step="0.01"
                value={formData.precio_hora}
                onChange={(e) => setFormData(prev => ({ ...prev, precio_hora: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_tiene_iluminacion"
                  checked={formData.tiene_iluminacion}
                  onChange={(e) => setFormData(prev => ({ ...prev, tiene_iluminacion: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit_tiene_iluminacion">Tiene Iluminación</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_tiene_vestuarios"
                  checked={formData.tiene_vestuarios}
                  onChange={(e) => setFormData(prev => ({ ...prev, tiene_vestuarios: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit_tiene_vestuarios">Tiene Vestuarios</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Asignar a Ligas (Selecciona una o más)</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2 bg-gray-50">
                {misLigas.length === 0 ? (
                  <p className="text-sm text-gray-500">Cargando tus ligas...</p>
                ) : (
                  misLigas.map((liga) => (
                    <div key={liga.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`liga_edit_${liga.id}`}
                        checked={formData.liga_ids?.includes(liga.id) || false}
                        onChange={(e) => {
                          const newIds = e.target.checked
                            ? [...(formData.liga_ids || []), liga.id]
                            : (formData.liga_ids || []).filter(id => id !== liga.id);
                          
                          if (newIds.length > 0) {
                            setFormData(prev => ({ ...prev, liga_ids: newIds }));
                          } else {
                            toast.error('Debe asignar la cancha al menos a una liga');
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`liga_edit_${liga.id}`} className="font-normal cursor-pointer">
                        {liga.nombre_liga}
                        {liga.id === ligaId && ' (Liga Actual)'}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar Cancha</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
