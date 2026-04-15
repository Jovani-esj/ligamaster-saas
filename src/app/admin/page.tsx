'use client';
import Dashboard from '@/components/admin/Dashboard';
import LigaManager from '@/components/admin/LigaManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Trophy, Settings } from 'lucide-react';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';

function AdminContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="ligas" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Ligas</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configuración</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="ligas" className="space-y-6">
            <LigaManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Configuración del Sistema</h3>
              <p className="text-gray-600">
                Panel de configuración del sistema - En desarrollo
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { profile } = useSimpleAuth();
  
  // Check if user has admin privileges
  const isAdmin = profile?.rol === 'admin_liga' || 
                  profile?.rol === 'adminadmin' || 
                  profile?.rol === 'superadmin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600">
              No tienes permisos de administrador para acceder a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <AdminContent />;
}
