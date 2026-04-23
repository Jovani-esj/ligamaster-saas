'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function LigaInactivaContent() {
  const searchParams = useSearchParams();
  const motivo = searchParams.get('motivo') || 'inactiva';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Liga Inactiva
          </h1>
          
          <p className="text-gray-600 mb-6">
            Esta liga se encuentra temporalmente inactiva y no está disponible para el público.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              La liga ha sido desactivada por el administrador. 
              {motivo === 'inactiva' && ' Esto podría ser por mantenimiento, reorganización o decisión del propietario.'}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href={`/buscar`}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Buscar otras ligas
            </Link>
            
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LigaInactiva() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LigaInactivaContent />
    </Suspense>
  );
}
