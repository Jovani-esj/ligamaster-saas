'use client';

import { Users, UserPlus } from 'lucide-react';
import RouteProtection from '@/components/auth/RouteProtection';

export default function GestionJugadoresPage() {
  return (
    <RouteProtection 
      allowedRoles={['capitan_equipo']}
      requireAuth={true}
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <UserPlus className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Jugadores</h1>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                Como Capitán de Equipo, puedes gestionar los jugadores de tu equipo, 
                agregar nuevos miembros y actualizar la información del roster.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <Users className="h-12 w-12 text-green-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Ver Jugadores</h3>
                <p className="text-gray-600">Consulta la lista completa de jugadores de tu equipo.</p>
              </div>
              
              <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <UserPlus className="h-12 w-12 text-blue-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Agregar Jugador</h3>
                <p className="text-gray-600">Añade nuevos jugadores a tu equipo.</p>
              </div>
              
              <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <Users className="h-12 w-12 text-purple-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Editar Información</h3>
                <p className="text-gray-600">Actualiza los datos de los jugadores existentes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteProtection>
  );
}
