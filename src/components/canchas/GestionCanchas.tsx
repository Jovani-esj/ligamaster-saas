'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Sun,
  Users,
  Home
} from 'lucide-react';

interface Cancha {
  id: string;
  liga_id: string;
  nombre: string;
  direccion?: string;
  tipo: string;
  superficie: string;
  capacidad_espectadores: number;
  tiene_iluminacion: boolean;
  tiene_vestuarios: boolean;
  precio_hora: number;
  activa: boolean;
  created_at: string;
}

export default function GestionCanchas() {
  const { user, profile } = useSimpleAuth();
  
  // For simple auth, check if user has admin roles
  const isAdminLiga = profile?.rol === 'admin_liga';
  const isAdminAdmin = profile?.rol === 'adminadmin' || profile?.rol === 'superadmin';
  const [loading, setLoading] = useState(true);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [showCrearCancha, setShowCrearCancha] = useState(false);
  const [editandoCancha, setEditandoCancha] = useState<Cancha | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    tipo: 'futbol',
    superficie: 'natural',
    capacidad_espectadores: 0,
    tiene_iluminacion: false,
    tiene_vestuarios: false,
    precio_hora: 0,
    liga_id: ''
  });

  const cargarCanchas = useCallback(async () => {
    try {
      let query = supabase.from('canchas').select('*');
      
      if (!isAdminAdmin && profile?.liga_id) {
        query = query.eq('liga_id', profile.liga_id);
      }

      const { data, error } = await query
        .eq('activa', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCanchas(data || []);
    } catch (error) {
      console.error('Error cargando canchas:', error);
      toast.error('Error al cargar las canchas');
    } finally {
      setLoading(false);
    }
  }, [isAdminAdmin, profile?.liga_id]);

  useEffect(() => {
    if (user && (isAdminLiga || isAdminAdmin)) {
      cargarCanchas();
    }
  }, [user, isAdminLiga, isAdminAdmin, cargarCanchas]);

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
      liga_id: ''
    });
    setEditandoCancha(null);
  };

  const guardarCancha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre de la cancha es requerido');
      return;
    }

    if (!profile?.liga_id && !isAdminAdmin) {
      toast.error('No tienes una liga asignada');
      return;
    }

    setLoading(true);
    try {
      const canchaData = {
        ...formData,
        liga_id: isAdminAdmin ? formData.liga_id || profile?.liga_id : profile?.liga_id,
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim() || null,
        capacidad_espectadores: parseInt(formData.capacidad_espectadores.toString()),
        precio_hora: parseFloat(formData.precio_hora.toString())
      };

      if (editandoCancha) {
        // Actualizar cancha existente
        const { error } = await supabase
          .from('canchas')
          .update(canchaData)
          .eq('id', editandoCancha.id);

        if (error) throw error;
        toast.success('Cancha actualizada exitosamente');
      } else {
        // Crear nueva cancha
        const { error } = await supabase
          .from('canchas')
          .insert([canchaData]);

        if (error) throw error;
        toast.success('Cancha creada exitosamente');
      }

      setShowCrearCancha(false);
      resetForm();
      await cargarCanchas();
    } catch (error) {
      console.error('Error guardando cancha:', error);
      toast.error('Error al guardar la cancha');
    } finally {
      setLoading(false);
    }
  };

  const editarCancha = (cancha: Cancha) => {
    setEditandoCancha(cancha);
    setFormData({
      nombre: cancha.nombre,
      direccion: cancha.direccion || '',
      tipo: cancha.tipo,
      superficie: cancha.superficie,
      capacidad_espectadores: cancha.capacidad_espectadores,
      tiene_iluminacion: cancha.tiene_iluminacion,
      tiene_vestuarios: cancha.tiene_vestuarios,
      precio_hora: cancha.precio_hora,
      liga_id: cancha.liga_id
    });
    setShowCrearCancha(true);
  };

  const eliminarCancha = async (canchaId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cancha?')) return;

    try {
      const { error } = await supabase
        .from('canchas')
        .update({ activa: false })
        .eq('id', canchaId);

      if (error) throw error;

      toast.success('Cancha eliminada exitosamente');
      await cargarCanchas();
    } catch (error) {
      console.error('Error eliminando cancha:', error);
      toast.error('Error al eliminar la cancha');
    }
  };

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

  if (!isAdminLiga && !isAdminAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600">
              No tienes permisos para gestionar canchas. Debes ser administrador de liga.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Canchas</h1>
            <p className="text-gray-600">
              Administra las canchas disponibles para los partidos
            </p>
          </div>
          <Button onClick={() => setShowCrearCancha(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cancha
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canchas.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay canchas registradas
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comienza agregando tu primera cancha
                  </p>
                  <Button onClick={() => setShowCrearCancha(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Cancha
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            canchas.map((cancha) => (
              <Card key={cancha.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{cancha.nombre}</CardTitle>
                      <p className="text-sm text-gray-500 capitalize">
                        {cancha.tipo.replace('_', ' ')} • {cancha.superficie}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editarCancha(cancha)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarCancha(cancha.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cancha.direccion && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-600">{cancha.direccion}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {cancha.capacidad_espectadores} espectadores
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          ${cancha.precio_hora}/hora
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {cancha.tiene_iluminacion && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Sun className="w-3 h-3 mr-1" />
                          Iluminación
                        </span>
                      )}
                      {cancha.tiene_vestuarios && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Home className="w-3 h-3 mr-1" />
                          Vestuarios
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modal Crear/Editar Cancha */}
        {showCrearCancha && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {editandoCancha ? 'Editar Cancha' : 'Nueva Cancha'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={guardarCancha} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        placeholder="Ej: Cancha Principal"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <select
                        id="tipo"
                        value={formData.tipo}
                        onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="futbol">Fútbol 11</option>
                        <option value="futbol_7">Fútbol 7</option>
                        <option value="futbol_5">Fútbol 5</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                      placeholder="Calle, número, colonia, ciudad"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="superficie">Superficie</Label>
                      <select
                        id="superficie"
                        value={formData.superficie}
                        onChange={(e) => setFormData({...formData, superficie: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="natural">Natural</option>
                        <option value="sintetico">Sintético</option>
                        <option value="cemento">Cemento</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="capacidad">Capacidad de Espectadores</Label>
                      <Input
                        id="capacidad"
                        type="number"
                        value={formData.capacidad_espectadores}
                        onChange={(e) => setFormData({...formData, capacidad_espectadores: parseInt(e.target.value) || 0})}
                        placeholder="100"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="precio_hora">Precio por Hora</Label>
                    <Input
                      id="precio_hora"
                      type="number"
                      step="0.01"
                      value={formData.precio_hora}
                      onChange={(e) => setFormData({...formData, precio_hora: parseFloat(e.target.value) || 0})}
                      placeholder="50.00"
                      min="0"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="iluminacion"
                        checked={formData.tiene_iluminacion}
                        onChange={(e) => setFormData({...formData, tiene_iluminacion: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="iluminacion" className="flex items-center">
                        <Sun className="w-4 h-4 mr-2" />
                        Tiene iluminación nocturna
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="vestuarios"
                        checked={formData.tiene_vestuarios}
                        onChange={(e) => setFormData({...formData, tiene_vestuarios: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="vestuarios" className="flex items-center">
                        <Home className="w-4 h-4 mr-2" />
                        Tiene vestuarios
                      </Label>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button type="submit" className="flex-1">
                      {editandoCancha ? 'Actualizar Cancha' : 'Crear Cancha'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCrearCancha(false);
                        resetForm();
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
    </div>
  );
}
