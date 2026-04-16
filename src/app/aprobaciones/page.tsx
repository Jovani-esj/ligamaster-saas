'use client';

import { CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import RouteProtection from '@/components/auth/RouteProtection';

export default function AprobacionesPage() {
  return (
    <RouteProtection 
      allowedRoles={['admin_liga']}
      requireAuth={true}
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Panel de Aprobaciones</h1>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">
                Como Administrador de Liga, puedes aprobar o rechazar solicitudes de equipos 
                y jugadores que desean unirse a tu liga.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">12</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Aprobados</p>
                    <p className="text-2xl font-bold text-green-600">45</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rechazados</p>
                    <p className="text-2xl font-bold text-red-600">8</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-blue-600">65</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Solicitudes Pendientes</h2>
              
              <div className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Equipo &quot;Los Tigres&quot;</h3>
                    <p className="text-sm text-gray-600">Solicitud para unirse a la Liga Premier</p>
                    <p className="text-xs text-gray-500">Hace 2 días</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      Aprobar
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Juan Pérez</h3>
                    <p className="text-sm text-gray-600">Solicitud para unirse como jugador</p>
                    <p className="text-xs text-gray-500">Hace 3 días</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      Aprobar
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteProtection>
  );
}
