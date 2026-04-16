'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCrearLigaPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página de crear liga existente
    router.push('/crear-liga');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}
