'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCanchasPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página de canchas existente
    router.push('/canchas');
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
