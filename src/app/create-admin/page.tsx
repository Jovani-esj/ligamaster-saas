'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CreateAdminPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createAdmin = async () => {
    if (!email) {
      setMessage('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // First, get the user profile by email
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        setMessage('Usuario no encontrado. Primero debe registrarse en el sistema.');
        return;
      }

      // Update the user's role to adminadmin
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          rol: 'adminadmin',
          activo: true 
        })
        .eq('id', profile.id);

      if (updateError) {
        setMessage('Error al actualizar rol: ' + updateError.message);
      } else {
        setMessage(`✅ Usuario ${email} ahora es Administrador del Sistema!`);
        setEmail('');
      }
    } catch (error) {
      setMessage('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Crear Administrador</h1>
          <p className="text-gray-600">
            Convierte un usuario existente en Administrador del Sistema
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email del Usuario
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <button
            onClick={createAdmin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Convertir en Administrador'}
          </button>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Instrucciones:</h3>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>El usuario ya debe estar registrado en el sistema</li>
            <li>Ingresa el email exacto del usuario</li>
            <li>Click en "Convertir en Administrador"</li>
            <li>El usuario podrá acceder a /admin-admin</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
