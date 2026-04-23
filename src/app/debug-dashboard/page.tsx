'use client';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';

export default function DebugDashboardPage() {
  const { user, profile, session, loading } = useSimpleAuth();

  console.log('Debug Dashboard - User:', user);
  console.log('Debug Dashboard - Profile:', profile);
  console.log('Debug Dashboard - Session:', session);
  console.log('Debug Dashboard - Loading:', loading);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Dashboard Authentication</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado de Autenticación</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Session exists:</strong> {session ? '✅ Sí' : '❌ No'}</p>
            <p><strong>User exists:</strong> {user ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Profile exists:</strong> {profile ? '✅ Sí' : '❌ No'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Datos del Usuario</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Datos del Perfil</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Datos de Sesión</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">LocalStorage</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                const savedSession = localStorage.getItem('simpleAuthSession');
                console.log('LocalStorage session:', savedSession);
                alert('Session en localStorage: ' + (savedSession ? 'EXISTS' : 'NOT FOUND'));
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Check LocalStorage
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('simpleAuthSession');
                window.location.reload();
              }}
              className="bg-red-500 text-white px-4 py-2 rounded ml-2"
            >
              Clear Session & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
