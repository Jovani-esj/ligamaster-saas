'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Jugador, 
  CreateJugadorData,
  PERMISOS_POR_ROL 
} from '@/types/database';
import { 
  getJugadores, 
  getJugador, 
  createJugador, 
  updateJugador, 
  deleteJugador 
} from '@/lib/database';
import { useAuth } from '@/components/auth/AuthenticationSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Eye, Users, Settings, User, Calendar } from 'lucide-react';

interface JugadorManagerProps {
  equipoId: string;
  equipoNombre?: string;
}

const POSICIONES = [
  'Portero',
  'Defensa',
  'Lateral',
  'Medio',
  'Centrocampista',
  'Delantero',
  'Extremo'
];

export default function JugadorManager({ equipoId, equipoNombre }: JugadorManagerProps) {
  const { profile } = useAuth();
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedJugador, setSelectedJugador] = useState<Jugador | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateJugadorData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    numero_camiseta: undefined,
    posicion: '',
    foto_url: '',
    es_capitan: false
  });

  // Verificar permisos
  const permisos = profile ? PERMISOS_POR_ROL[profile.rol] : null;
  const puedeVerJugadores = permisos?.puede_ver_jugadores || false;
  const puedeCrearJugadores = permisos?.puede_crear_jugadores || false;
  const puedeEditarJugadores = permisos?.puede_editar_jugadores || false;
  const puedeEliminarJugadores = permisos?.puede_eliminar_jugadores || false;

  const fetchJugadores = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getJugadores(equipoId);
      setJugadores(data);
    } catch (error) {
      console.error('Error fetching jugadores:', error);
      toast.error('Error al cargar los jugadores');
    } finally {
      setLoading(false);
    }
  }, [equipoId]);

  useEffect(() => {
    if (puedeVerJugadores && equipoId) {
      fetchJugadores();
    }
  }, [puedeVerJugadores, equipoId, fetchJugadores]);

  const handleCreateJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeCrearJugadores) return;

    try {
      await createJugador(formData, equipoId);
      toast.success('Jugador creado correctamente');
      setShowCreateDialog(false);
      resetForm();
      fetchJugadores();
    } catch (error) {
      console.error('Error creating jugador:', error);
      toast.error('Error al crear el jugador');
    }
  };

  const handleUpdateJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJugador || !puedeEditarJugadores) return;

    try {
      await updateJugador(selectedJugador.id, formData);
      toast.success('Jugador actualizado correctamente');
      setShowEditDialog(false);
      setSelectedJugador(null);
      resetForm();
      fetchJugadores();
    } catch (error) {
      console.error('Error updating jugador:', error);
      toast.error('Error al actualizar el jugador');
    }
  };

  const handleDeleteJugador = async (jugadorId: string) => {
    if (!puedeEliminarJugadores) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este jugador? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteJugador(jugadorId);
      toast.success('Jugador eliminado correctamente');
      fetchJugadores();
    } catch (error) {
      console.error('Error deleting jugador:', error);
      toast.error('Error al eliminar el jugador');
    }
  };

  const openEditDialog = (jugador: Jugador) => {
    setSelectedJugador(jugador);
    setFormData({
      nombre: jugador.nombre,
      apellido: jugador.apellido || '',
      email: jugador.email || '',
      telefono: jugador.telefono || '',
      fecha_nacimiento: jugador.fecha_nacimiento || '',
      numero_camiseta: jugador.numero_camiseta,
      posicion: jugador.posicion || '',
      foto_url: jugador.foto_url || '',
      es_capitan: jugador.es_capitan
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      fecha_nacimiento: '',
      numero_camiseta: undefined,
      posicion: '',
      foto_url: '',
      es_capitan: false
    });
  };

  const getEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  if (!puedeVerJugadores) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-600">No tienes permisos para ver los jugadores</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Jugadores</h2>
          {equipoNombre && (
            <p className="text-gray-600 mt-1">Equipo: {equipoNombre}</p>
          )}
        </div>
        {puedeCrearJugadores && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Jugador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Jugador</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateJugador} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fecha_nacimiento">Fecha Nacimiento</Label>
                    <Input
                      id="fecha_nacimiento"
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={(e) => setFormData(prev => ({ ...prev, fecha_nacimiento: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="numero_camiseta">Número Camiseta</Label>
                    <Input
                      id="numero_camiseta"
                      type="number"
                      min="1"
                      max="99"
                      value={formData.numero_camiseta || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, numero_camiseta: e.target.value ? parseInt(e.target.value) : undefined }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="posicion">Posición</Label>
                    <Select value={formData.posicion} onValueChange={(value) => setFormData(prev => ({ ...prev, posicion: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar posición" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSICIONES.map(pos => (
                          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="foto_url">URL de Foto (opcional)</Label>
                  <Input
                    id="foto_url"
                    type="url"
                    value={formData.foto_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, foto_url: e.target.value }))}
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="es_capitan"
                    checked={formData.es_capitan}
                    onChange={(e) => setFormData(prev => ({ ...prev, es_capitan: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="es_capitan">Es capitán del equipo</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Jugador</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando jugadores...</p>
        </div>
      ) : jugadores.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-600">No hay jugadores registrados</h3>
          {puedeCrearJugadores && (
            <p className="text-gray-500 mt-2">Agrega jugadores al equipo para comenzar</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jugadores.map((jugador) => (
            <Card key={jugador.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    {jugador.foto_url ? (
                      <img 
                        src={jugador.foto_url} 
                        alt={`${jugador.nombre} ${jugador.apellido}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {jugador.nombre} {jugador.apellido}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {jugador.numero_camiseta && (
                          <Badge variant="secondary">#{jugador.numero_camiseta}</Badge>
                        )}
                        {jugador.posicion && (
                          <Badge variant="outline">{jugador.posicion}</Badge>
                        )}
                        {jugador.es_capitan && (
                          <Badge className="bg-yellow-500">Capitán</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={jugador.activo ? 'bg-green-500' : 'bg-red-500'}>
                    {jugador.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="info">
                      <Eye className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="actions">
                      <Settings className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="mt-4">
                    <div className="space-y-2 text-sm">
                      {jugador.email && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="truncate">{jugador.email}</span>
                        </div>
                      )}
                      {jugador.telefono && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Teléfono:</span>
                          <span>{jugador.telefono}</span>
                        </div>
                      )}
                      {jugador.fecha_nacimiento && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Edad:</span>
                          <span>{getEdad(jugador.fecha_nacimiento)} años</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registrado:</span>
                        <span>{new Date(jugador.fecha_registro).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="actions" className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {puedeEditarJugadores && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(jugador)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      )}
                      {puedeEliminarJugadores && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteJugador(jugador.id)}
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
            <DialogTitle>Editar Jugador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateJugador} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_nombre">Nombre *</Label>
                <Input
                  id="edit_nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_apellido">Apellido</Label>
                <Input
                  id="edit_apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_telefono">Teléfono</Label>
                <Input
                  id="edit_telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_fecha_nacimiento">Fecha Nacimiento</Label>
                <Input
                  id="edit_fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_nacimiento: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_numero_camiseta">Número Camiseta</Label>
                <Input
                  id="edit_numero_camiseta"
                  type="number"
                  min="1"
                  max="99"
                  value={formData.numero_camiseta || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero_camiseta: e.target.value ? parseInt(e.target.value) : undefined }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_posicion">Posición</Label>
                <Select value={formData.posicion} onValueChange={(value) => setFormData(prev => ({ ...prev, posicion: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar posición" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSICIONES.map(pos => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit_foto_url">URL de Foto (opcional)</Label>
              <Input
                id="edit_foto_url"
                type="url"
                value={formData.foto_url}
                onChange={(e) => setFormData(prev => ({ ...prev, foto_url: e.target.value }))}
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_es_capitan"
                checked={formData.es_capitan}
                onChange={(e) => setFormData(prev => ({ ...prev, es_capitan: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="edit_es_capitan">Es capitán del equipo</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar Jugador</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
