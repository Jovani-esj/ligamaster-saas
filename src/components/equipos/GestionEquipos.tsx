'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthenticationSystem';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus,
  Shield,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

interface Equipo {
  id: string;
  nombre: string;
  logo_url?: string;
  color_primario: string;
  color_secundario: string;
  capitan_id: string;
  activo: boolean;
  liga_id: string;
  created_at: string;
}

interface Jugador {
  id: string;
  equipo_id: string;
  user_profile_id?: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  numero_camiseta?: number;
  posicion?: string;
  foto_url?: string;
  activo: boolean;
  es_capitan: boolean;
  fecha_registro: string;
}

export default function GestionEquipos() {
  const { user, profile, isCapitanEquipo, isAdminLiga } = useAuth();
  const [loading, setLoading] = useState(true);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<string>('');
  const [showCrearEquipo, setShowCrearEquipo] = useState(false);
  const [showAgregarJugador, setShowAgregarJugador] = useState(false);

  // Formularios
  const [nuevoEquipo, setNuevoEquipo] = useState({
    nombre: '',
    color_primario: '#000000',
    color_secundario: '#FFFFFF'
  });

  const [nuevoJugador, setNuevoJugador] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    numero_camiseta: '',
    posicion: 'delantero'
  });

  useEffect(() => {
    if (user && (isCapitanEquipo || isAdminLiga)) {
      cargarEquipos();
    }
  }, [user, isCapitanEquipo, isAdminLiga]);

  useEffect(() => {
    if (equipoSeleccionado) {
      cargarJugadores(equipoSeleccionado);
    }
  }, [equipoSeleccionado]);

  const cargarEquipos = async () => {
    try {
      let query = supabase.from('equipos').select('*');
      
      if (isCapitanEquipo && !isAdminLiga) {
        query = query.eq('capitan_id', user?.id);
      } else if (profile?.liga_id) {
        query = query.eq('liga_id', profile.liga_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setEquipos(data || []);
      
      if (data && data.length > 0) {
        setEquipoSeleccionado(data[0].id);
      }
    } catch (error) {
      console.error('Error cargando equipos:', error);
      toast.error('Error al cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  const cargarJugadores = async (equipoId: string) => {
    try {
      const { data, error } = await supabase
        .from('jugadores')
        .select('*')
        .eq('equipo_id', equipoId)
        .eq('activo', true)
        .order('nombre');

      if (error) throw error;
      setJugadores(data || []);
    } catch (error) {
      console.error('Error cargando jugadores:', error);
      toast.error('Error al cargar los jugadores');
    }
  };

  const crearEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nuevoEquipo.nombre.trim()) {
      toast.error('El nombre del equipo es requerido');
      return;
    }

    if (!profile?.liga_id) {
      toast.error('No tienes una liga asignada');
      return;
    }

    setLoading(true);
    try {
      // Verificar si ya existe un equipo con ese nombre en la liga
      const { data: existente } = await supabase
        .from('equipos')
        .select('id')
        .eq('liga_id', profile.liga_id)
        .eq('nombre', nuevoEquipo.nombre.trim())
        .single();

      if (existente) {
        toast.error('Ya existe un equipo con ese nombre en esta liga');
        return;
      }

      const { error } = await supabase
        .from('equipos')
        .insert([{
          liga_id: profile.liga_id,
          nombre: nuevoEquipo.nombre.trim(),
          capitan_id: user?.id,
          color_primario: nuevoEquipo.color_primario,
          color_secundario: nuevoEquipo.color_secundario
        }]);

      if (error) throw error;

      toast.success('Equipo creado exitosamente');
      setShowCrearEquipo(false);
      setNuevoEquipo({ nombre: '', color_primario: '#000000', color_secundario: '#FFFFFF' });
      await cargarEquipos();
    } catch (error) {
      console.error('Error creando equipo:', error);
      toast.error('Error al crear el equipo');
    } finally {
      setLoading(false);
    }
  };

  const agregarJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nuevoJugador.nombre.trim()) {
      toast.error('El nombre del jugador es requerido');
      return;
    }

    if (!equipoSeleccionado) {
      toast.error('Selecciona un equipo primero');
      return;
    }

    setLoading(true);
    try {
      // Verificar si el jugador ya está registrado en otro equipo
      if (nuevoJugador.email) {
        const { data: jugadorExistente } = await supabase
          .from('jugadores')
          .select('id, equipo_id, nombre')
          .eq('email', nuevoJugador.email.trim())
          .eq('activo', true)
          .single();

        if (jugadorExistente) {
          const { data: equipoJugador } = await supabase
            .from('equipos')
            .select('nombre')
            .eq('id', jugadorExistente.equipo_id)
            .single();

          toast.error(`Este jugador ya está registrado en el equipo: ${equipoJugador?.nombre || 'Desconocido'}`);
          return;
        }
      }

      const { error } = await supabase
        .from('jugadores')
        .insert([{
          equipo_id: equipoSeleccionado,
          nombre: nuevoJugador.nombre.trim(),
          apellido: nuevoJugador.apellido.trim() || null,
          email: nuevoJugador.email.trim() || null,
          telefono: nuevoJugador.telefono.trim() || null,
          fecha_nacimiento: nuevoJugador.fecha_nacimiento || null,
          numero_camiseta: nuevoJugador.numero_camiseta ? parseInt(nuevoJugador.numero_camiseta) : null,
          posicion: nuevoJugador.posicion
        }]);

      if (error) throw error;

      toast.success('Jugador agregado exitosamente');
      setShowAgregarJugador(false);
      setNuevoJugador({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        numero_camiseta: '',
        posicion: 'delantero'
      });
      await cargarJugadores(equipoSeleccionado);
    } catch (error) {
      console.error('Error agregando jugador:', error);
      toast.error('Error al agregar el jugador');
    } finally {
      setLoading(false);
    }
  };

  const eliminarJugador = async (jugadorId: string) => {
    if (!confirm('¿Estás seguro de eliminar este jugador?')) return;

    try {
      const { error } = await supabase
        .from('jugadores')
        .update({ activo: false })
        .eq('id', jugadorId);

      if (error) throw error;

      toast.success('Jugador eliminado exitosamente');
      await cargarJugadores(equipoSeleccionado);
    } catch (error) {
      console.error('Error eliminando jugador:', error);
      toast.error('Error al eliminar el jugador');
    }
  };

  const eliminarEquipo = async (equipoId: string) => {
    if (!confirm('¿Estás seguro de eliminar este equipo? También se eliminarán todos sus jugadores.')) return;

    try {
      const { error } = await supabase
        .from('equipos')
        .update({ activo: false })
        .eq('id', equipoId);

      if (error) throw error;

      toast.success('Equipo eliminado exitosamente');
      await cargarEquipos();
      if (equipoSeleccionado === equipoId) {
        setEquipoSeleccionado('');
        setJugadores([]);
      }
    } catch (error) {
      console.error('Error eliminando equipo:', error);
      toast.error('Error al eliminar el equipo');
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

  if (!isCapitanEquipo && !isAdminLiga) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600">
              No tienes permisos para gestionar equipos. Debes ser capitán de equipo o administrador de liga.
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Equipos</h1>
          <p className="text-gray-600">
            Administra tus equipos y jugadores
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Equipos */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Mis Equipos
                </CardTitle>
                {isCapitanEquipo && (
                  <Button
                    onClick={() => setShowCrearEquipo(true)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Nuevo
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {equipos.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No tienes equipos registrados
                    </p>
                  ) : (
                    equipos.map((equipo) => (
                      <div
                        key={equipo.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          equipoSeleccionado === equipo.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setEquipoSeleccionado(equipo.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: equipo.color_primario }}
                            >
                              {equipo.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{equipo.nombre}</p>
                              <p className="text-sm text-gray-500">
                                {jugadores.filter(j => j.equipo_id === equipo.id).length} jugadores
                              </p>
                            </div>
                          </div>
                          {equipo.capitan_id === user?.id && (
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Capitán
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalles del Equipo y Jugadores */}
          <div className="lg:col-span-2">
            {equipoSeleccionado ? (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {equipos.find(e => e.id === equipoSeleccionado)?.nombre}
                      </CardTitle>
                      <Button
                        onClick={() => setShowAgregarJugador(true)}
                        size="sm"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Agregar Jugador
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Jugadores ({jugadores.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">#</th>
                            <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Nombre</th>
                            <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Posición</th>
                            <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Contacto</th>
                            <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jugadores.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-8 text-gray-500">
                                No hay jugadores registrados
                              </td>
                            </tr>
                          ) : (
                            jugadores.map((jugador) => (
                              <tr key={jugador.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-2">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
                                    {jugador.numero_camiseta || '-'}
                                  </span>
                                </td>
                                <td className="py-3 px-2">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {jugador.nombre} {jugador.apellido}
                                    </p>
                                    {jugador.es_capitan && (
                                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                        Capitán
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  <span className="text-sm text-gray-600 capitalize">
                                    {jugador.posicion || '-'}
                                  </span>
                                </td>
                                <td className="py-3 px-2">
                                  <div className="space-y-1">
                                    {jugador.email && (
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="w-3 h-3 mr-1" />
                                        {jugador.email}
                                      </div>
                                    )}
                                    {jugador.telefono && (
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Phone className="w-3 h-3 mr-1" />
                                        {jugador.telefono}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => eliminarJugador(jugador.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecciona un equipo
                  </h3>
                  <p className="text-gray-500">
                    Elige un equipo de la lista para ver y gestionar sus jugadores
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Modal Crear Equipo */}
        {showCrearEquipo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Crear Nuevo Equipo</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={crearEquipo} className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre del Equipo *</Label>
                    <Input
                      id="nombre"
                      value={nuevoEquipo.nombre}
                      onChange={(e) => setNuevoEquipo({...nuevoEquipo, nombre: e.target.value})}
                      placeholder="Ej: Los Tigres"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="color_primario">Color Primario</Label>
                      <Input
                        id="color_primario"
                        type="color"
                        value={nuevoEquipo.color_primario}
                        onChange={(e) => setNuevoEquipo({...nuevoEquipo, color_primario: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="color_secundario">Color Secundario</Label>
                      <Input
                        id="color_secundario"
                        type="color"
                        value={nuevoEquipo.color_secundario}
                        onChange={(e) => setNuevoEquipo({...nuevoEquipo, color_secundario: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button type="submit" className="flex-1">
                      Crear Equipo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCrearEquipo(false)}
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

        {/* Modal Agregar Jugador */}
        {showAgregarJugador && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Agregar Nuevo Jugador</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={agregarJugador} className="space-y-4">
                  <div>
                    <Label htmlFor="jugador_nombre">Nombre *</Label>
                    <Input
                      id="jugador_nombre"
                      value={nuevoJugador.nombre}
                      onChange={(e) => setNuevoJugador({...nuevoJugador, nombre: e.target.value})}
                      placeholder="Nombre del jugador"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="jugador_apellido">Apellido</Label>
                    <Input
                      id="jugador_apellido"
                      value={nuevoJugador.apellido}
                      onChange={(e) => setNuevoJugador({...nuevoJugador, apellido: e.target.value})}
                      placeholder="Apellido del jugador"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jugador_email">Email</Label>
                    <Input
                      id="jugador_email"
                      type="email"
                      value={nuevoJugador.email}
                      onChange={(e) => setNuevoJugador({...nuevoJugador, email: e.target.value})}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jugador_telefono">Teléfono</Label>
                    <Input
                      id="jugador_telefono"
                      value={nuevoJugador.telefono}
                      onChange={(e) => setNuevoJugador({...nuevoJugador, telefono: e.target.value})}
                      placeholder="+52 555 123 4567"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jugador_numero">Número</Label>
                      <Input
                        id="jugador_numero"
                        type="number"
                        value={nuevoJugador.numero_camiseta}
                        onChange={(e) => setNuevoJugador({...nuevoJugador, numero_camiseta: e.target.value})}
                        placeholder="10"
                        min="1"
                        max="99"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jugador_posicion">Posición</Label>
                      <select
                        id="jugador_posicion"
                        value={nuevoJugador.posicion}
                        onChange={(e) => setNuevoJugador({...nuevoJugador, posicion: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="portero">Portero</option>
                        <option value="defensa">Defensa</option>
                        <option value="medio">Mediocampista</option>
                        <option value="delantero">Delantero</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="jugador_fecha_nacimiento">Fecha de Nacimiento</Label>
                    <Input
                      id="jugador_fecha_nacimiento"
                      type="date"
                      value={nuevoJugador.fecha_nacimiento}
                      onChange={(e) => setNuevoJugador({...nuevoJugador, fecha_nacimiento: e.target.value})}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button type="submit" className="flex-1">
                      Agregar Jugador
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAgregarJugador(false)}
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
