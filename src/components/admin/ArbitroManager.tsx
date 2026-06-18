'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Shield, Mail, User, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Referee {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  activo: boolean;
  liga_id: string;
  created_at: string;
}

export default function ArbitroManager({ ligaId }: { ligaId?: string }) {
  const { profile } = useSimpleAuth();
  const effectiveLigaId = ligaId || profile?.liga_id;

  const [referees, setReferees] = useState<Referee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: ''
  });

  const fetchReferees = useCallback(async () => {
    if (!effectiveLigaId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/auth-simple/referees?ligaId=${effectiveLigaId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setReferees(data.arbitros || []);
      } else {
        throw new Error(data.error || 'Error al cargar árbitros');
      }
    } catch (error: any) {
      console.error('Error fetching referees:', error);
      toast.error(error.message || 'Error al cargar árbitros');
    } finally {
      setLoading(false);
    }
  }, [effectiveLigaId]);

  useEffect(() => {
    if (effectiveLigaId) {
      fetchReferees();
    }
  }, [effectiveLigaId, fetchReferees]);

  const handleCreateReferee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveLigaId) return;

    if (!formData.email || !formData.password || !formData.nombre) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    try {
      const res = await fetch('/api/auth-simple/referees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nombre: formData.nombre,
          apellido: formData.apellido,
          ligaId: effectiveLigaId
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Árbitro registrado exitosamente');
        setShowCreateDialog(false);
        setFormData({ nombre: '', apellido: '', email: '', password: '' });
        fetchReferees();
      } else {
        throw new Error(data.error || 'Error al registrar árbitro');
      }
    } catch (error: any) {
      console.error('Error creating referee:', error);
      toast.error(error.message || 'Error al crear árbitro');
    }
  };

  const handleDeleteReferee = async (refereeId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta de árbitro?')) return;

    try {
      // Eliminar de usuarios_simple
      const { error } = await supabase
        .from('usuarios_simple')
        .delete()
        .eq('id', refereeId);

      if (error) throw error;

      // Intentar eliminar de user_profiles
      try {
        await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', refereeId);
      } catch (e) {
        console.warn('Error profile cleanup:', e);
      }

      toast.success('Árbitro eliminado exitosamente');
      fetchReferees();
    } catch (error: any) {
      console.error('Error deleting referee:', error);
      toast.error('Error al eliminar árbitro');
    }
  };

  const filteredReferees = referees.filter(ref => 
    ref.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Árbitros</h2>
          <p className="text-sm text-gray-500">Crea cuentas de árbitros para que registren marcadores e incidencias de juego</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Árbitro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Cuenta de Árbitro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateReferee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ref_nombre">Nombre *</Label>
                  <Input
                    id="ref_nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Roberto"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ref_apellido">Apellido</Label>
                  <Input
                    id="ref_apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                    placeholder="Ej: Gómez"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ref_email">Correo Electrónico *</Label>
                <Input
                  id="ref_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="arbitro@ejemplo.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="ref_password">Contraseña temporal *</Label>
                <Input
                  id="ref_password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Árbitro</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500 text-sm">Cargando árbitros...</p>
            </div>
          ) : filteredReferees.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">No hay árbitros registrados</h3>
              <p className="text-gray-500 mt-1">Crea una cuenta para que un árbitro gestione los marcadores de la liga</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 px-4 text-sm font-medium text-gray-700">Nombre</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-700">Correo</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-700">Rol</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferees.map((ref) => (
                    <tr key={ref.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{ref.nombre} {ref.apellido}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{ref.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <Badge className="bg-green-100 text-green-800">
                          Árbitro
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <Badge className={ref.activo ? 'bg-green-500' : 'bg-red-500'}>
                          {ref.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReferee(ref.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
