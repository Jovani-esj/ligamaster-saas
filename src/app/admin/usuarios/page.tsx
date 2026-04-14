'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  estatus: string;
  tenant_id?: string;
  tenant_name?: string;
  created_at: string;
}

export default function UsuariosAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('todos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    nombre: '',
    apellido: '',
    rol: 'usuario',
    password: ''
  });

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select(`
            *,
            tenants!inner(nombre_liga)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          toast.error('Error al cargar usuarios: ' + error.message);
          return;
        }

        setUsers(data || []);
      } catch (error) {
        toast.error('Error inesperado al cargar usuarios');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarUsuarios();
  }, []);

  const filteredUsers = users.filter(user => 
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredByRole = selectedRole === 'todos' 
    ? filteredUsers 
    : filteredUsers.filter(user => user.rol === selectedRole);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, rol: newRole } : user
    ));
    toast.success('Rol actualizado exitosamente');
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        toast.error('Error al eliminar usuario: ' + error.message);
      } else {
        setUsers(users.filter(user => user.id !== userId));
        toast.success('Usuario eliminado exitosamente');
      }
    } catch (error) {
      toast.error('Error inesperado al eliminar usuario');
      console.error('Error:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.nombre || !newUser.apellido || !newUser.password) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      // 1. Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            nombre: newUser.nombre,
            apellido: newUser.apellido
          }
        }
      });

      if (authError) {
        toast.error('Error al crear usuario: ' + authError.message);
        return;
      }

      if (!authData.user) {
        toast.error('Error: No se pudo crear el usuario correctamente');
        return;
      }

      // 2. Crear perfil en user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: authData.user.id,
          nombre: newUser.nombre,
          apellido: newUser.apellido,
          rol: newUser.rol,
          estatus: 'activo'
        }]);

      if (profileError) {
        toast.error('Error al crear perfil: ' + profileError.message);
      } else {
        toast.success('Usuario creado exitosamente');
        setShowCreateModal(false);
        setNewUser({
          email: '',
          nombre: '',
          apellido: '',
          rol: 'usuario',
          password: ''
        });
        
        // Recargar lista de usuarios
        const { data: updatedUsers } = await supabase
          .from('user_profiles')
          .select(`
            *,
            tenants!inner(nombre_liga)
          `)
          .order('created_at', { ascending: false });
        
        setUsers(updatedUsers || []);
      }
    } catch (error) {
      toast.error('Error inesperado al crear usuario');
      console.error('Error:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-100 text-red-800';
      case 'admin_liga': return 'bg-purple-100 text-purple-800';
      case 'entrenador': return 'bg-blue-100 text-blue-800';
      case 'arbitro': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600">Administra todos los usuarios y sus permisos</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar usuarios</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Buscar por nombre, email o apellido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Label htmlFor="role">Filtrar por rol</Label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos los roles</option>
                  <option value="superadmin">Super Administrador</option>
                  <option value="admin_liga">Administrador de Liga</option>
                  <option value="entrenador">Entrenador</option>
                  <option value="arbitro">Árbitro</option>
                  <option value="usuario">Usuario</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredByRole.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Liga
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredByRole.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {user.nombre} {user.apellido}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getRoleColor(user.rol)}>
                            {user.rol}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.tenant_name || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={user.estatus === 'activo' ? 'default' : 'secondary'}
                            className={user.estatus === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {user.estatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <select
                              value={user.rol}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="text-sm border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="superadmin">Super Admin</option>
                              <option value="admin_liga">Admin Liga</option>
                              <option value="entrenador">Entrenador</option>
                              <option value="arbitro">Árbitro</option>
                              <option value="usuario">Usuario</option>
                            </select>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron usuarios
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No hay resultados para "${searchTerm}"`
                    : 'No hay usuarios registrados'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Usuario</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      type="text"
                      value={newUser.nombre}
                      onChange={(e) => setNewUser(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Juan"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      type="text"
                      value={newUser.apellido}
                      onChange={(e) => setNewUser(prev => ({ ...prev, apellido: e.target.value }))}
                      placeholder="Pérez"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="rol">Rol *</Label>
                  <select
                    id="rol"
                    value={newUser.rol}
                    onChange={(e) => setNewUser(prev => ({ ...prev, rol: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="usuario">Usuario</option>
                    <option value="entrenador">Entrenador</option>
                    <option value="arbitro">Árbitro</option>
                    <option value="admin_liga">Administrador de Liga</option>
                    <option value="superadmin">Super Administrador</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full"
                    required
                  />
                </div>
              </form>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  Crear Usuario
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
