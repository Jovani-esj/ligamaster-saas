'use client';
import { useState } from 'react';
import DashboardMetrics from '@/components/admin/DashboardMetrics';
import LigaManagement from '@/components/admin/LigaManagement';
import PaymentSimulation from '@/components/admin/PaymentSimulation';
import { ProtectedRoute } from '@/components/auth/AuthenticationSystem';

function SuperAdminContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'ligas', label: 'Gestión de Ligas', icon: '⚽' },
    { id: 'pagos', label: 'Simulación de Pagos', icon: '💳' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs de navegación */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido del tab activo */}
      <div>
        {activeTab === 'dashboard' && <DashboardMetrics />}
        {activeTab === 'ligas' && <LigaManagement />}
        {activeTab === 'pagos' && <PaymentSimulation />}
      </div>
    </div>
  );
}

export default function SuperAdminPage() {
  return (
    <ProtectedRoute requireSuperAdmin={true}>
      <SuperAdminContent />
    </ProtectedRoute>
  );
}
