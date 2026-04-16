'use client';

import { Shield, Settings, Database, Users, Globe } from 'lucide-react';
import RouteProtection from '@/components/auth/RouteProtection';

export default function ConfiguracionSistemaPage() {
  return (
    <RouteProtection 
      allowedRoles={['superadmin']}
      requireAuth={true}
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-purple-800">
                Como SuperAdministrador, tienes control total sobre la configuración del sistema, 
                gestión de usuarios y parámetros globales de la plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <Database className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Base de Datos</h3>
                <p className="text-gray-600 mb-4">Gestión de respaldos, migraciones y mantenimiento de la base de datos.</p>
                <button className="text-blue-600 hover:text-blue-800 font-medium">Configurar →</button>
              </div>
              
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <Users className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gestión de Usuarios</h3>
                <p className="text-gray-600 mb-4">Administración de todos los usuarios del sistema y permisos.</p>
                <button className="text-green-600 hover:text-green-800 font-medium">Administrar →</button>
              </div>
              
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <Globe className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Configuración Global</h3>
                <p className="text-gray-600 mb-4">Parámetros generales del sistema y configuraciones globales.</p>
                <button className="text-purple-600 hover:text-purple-800 font-medium">Configurar →</button>
              </div>
              
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <Settings className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Integraciones</h3>
                <p className="text-gray-600 mb-4">Configuración de servicios externos y APIs de terceros.</p>
                <button className="text-orange-600 hover:text-orange-800 font-medium">Configurar →</button>
              </div>
              
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Seguridad</h3>
                <p className="text-gray-600 mb-4">Políticas de seguridad, autenticación y control de acceso.</p>
                <button className="text-red-600 hover:text-red-800 font-medium">Configurar →</button>
              </div>
              
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <Settings className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sistema</h3>
                <p className="text-gray-600 mb-4">Logs, monitoreo y configuración del servidor.</p>
                <button className="text-gray-600 hover:text-gray-800 font-medium">Configurar →</button>
              </div>
            </div>

            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Advertencia de Seguridad</h3>
              <p className="text-yellow-700">
                Esta sección contiene configuraciones críticas del sistema. Los cambios realizados aquí 
                pueden afectar el funcionamiento de toda la plataforma. Proceda con extremo cuidado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </RouteProtection>
  );
}
