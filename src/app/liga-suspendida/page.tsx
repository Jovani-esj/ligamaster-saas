'use client';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CreditCard, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function LigaSuspendida() {
  const searchParams = useSearchParams();
  const nombre = searchParams.get('nombre') || 'esta liga';
  const plan = searchParams.get('plan') || 'Bronce';

  const precios: { [key: string]: number } = {
    'Bronce': 100,
    'Plata': 200,
    'Oro': 500
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Servicio Suspendido
          </h1>
          
          <p className="text-gray-600 mb-6">
            La liga <strong>{nombre}</strong> se encuentra temporalmente suspendida por falta de pago.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <CreditCard className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-800">Plan {plan}</span>
            </div>
            <p className="text-yellow-700 text-sm">
              Costo mensual: ${precios[plan] || 100}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="text-left bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">¿Qué necesitas hacer?</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Contacta al administrador de la liga</li>
                <li>2. Realiza el pago correspondiente</li>
                <li>3. Espera la confirmación de activación</li>
              </ol>
            </div>

            <div className="text-left bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Información de contacto</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>admin@ligamaster.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+52 (555) 123-4567</span>
                </div>
              </div>
            </div>
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
