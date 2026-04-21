'use client';
import { useEffect, useState } from 'react';
import RouteProtection from '@/components/auth/RouteProtection';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { User, Phone, Calendar, Shield, Trophy, Edit2 } from 'lucide-react';
import Link from 'next/link';

export default function PerfilPage() {
  const { user, profile } = useSimpleAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    fecha_nacimiento: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        apellido: profile.apellido || '',
        telefono: profile.telefono || '',
        fecha_nacimiento: profile.fecha_nacimiento || ''
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // updateProfile not implemented in SimpleAuth - would need API call
      // const success = await updateProfile(formData);
      // For now, just simulate success
      setIsEditing(false);
      alert('Función de actualización no implementada en sistema simple');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (rol: string) => {
    switch (rol) {
      case 'superadmin': return 'bg-red-100 text-red-800';
      case 'admin_liga': return 'bg-purple-100 text-purple-800';
      case 'usuario': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case 'superadmin': return '👑';
      case 'admin_liga': return '🥈';
      case 'usuario': return '👤';
      default: return '👤';
    }
  };

  if (!user) {
    return (
      <RouteProtection>
        <div className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuario...</p>
          </div>
        </div>
      </RouteProtection>
    );
  }

  // Si el usuario existe pero no hay perfil, mostrar un estado de error o crear perfil
  if (!profile) {
    return (
      <RouteProtection>
        <div className="p-8">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Perfil no encontrado</h3>
              <p className="text-yellow-600 mb-4">
                Tu perfil no está configurado correctamente. Esto puede deberse a un problema en el sistema.
              </p>
              <div className="space-y-2 text-sm text-yellow-700">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Creado:</strong> N/A</p>
              </div>
            </div>
            <Link 
              href="/auth/login" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </RouteProtection>
    );
  }

  return (
    <RouteProtection>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
            <p className="text-gray-600">
              Gestiona tu información personal y preferencias
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información básica */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {profile.nombre} {profile.apellido}
                  </h2>
                  <p className="text-gray-600 mb-4">{user.email}</p>
                  
                  <div className="space-y-2">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profile.rol)}`}>
                      <span className="mr-2">{getRoleIcon(profile.rol)}</span>
                      {profile.rol === 'superadmin' ? 'SuperAdmin' : 
                       profile.rol === 'admin_liga' ? 'Administrador de Liga' : 'Usuario'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center mb-2">
                      <Shield className="h-4 w-4 mr-2" />
                      <span>ID: {user.id}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Miembro desde: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de edición */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre
                        </label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                          Apellido
                        </label>
                        <input
                          type="text"
                          id="apellido"
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="tel"
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          placeholder="+52 (555) 123-4567"
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Nacimiento
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="date"
                          id="fecha_nacimiento"
                          name="fecha_nacimiento"
                          value={formData.fecha_nacimiento}
                          onChange={handleInputChange}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          if (profile) {
                            setFormData({
                              nombre: profile.nombre || '',
                              apellido: profile.apellido || '',
                              telefono: profile.telefono || '',
                              fecha_nacimiento: profile.fecha_nacimiento || ''
                            });
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Guardando...
                          </div>
                        ) : (
                          'Guardar Cambios'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Nombre</h4>
                        <p className="text-gray-900">
                          {profile.nombre || 'No especificado'}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Apellido</h4>
                        <p className="text-gray-900">
                          {profile.apellido || 'No especificado'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Teléfono</h4>
                      <p className="text-gray-900">
                        {profile.telefono || 'No especificado'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</h4>
                      <p className="text-gray-900">
                        {profile.fecha_nacimiento 
                          ? new Date(profile.fecha_nacimiento).toLocaleDateString()
                          : 'No especificada'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/mis-ligas"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Trophy className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Mis Ligas</h4>
                    <p className="text-sm text-gray-600">Gestiona tus ligas</p>
                  </div>
                </Link>

                <Link
                  href="/configuracion"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Shield className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Configuración</h4>
                    <p className="text-sm text-gray-600">Ajustes de cuenta</p>
                  </div>
                </Link>

                <Link
                  href="/unirse-liga"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <User className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Buscar Ligas</h4>
                    <p className="text-sm text-gray-600">Descubre nuevas ligas</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteProtection>
  );
}
