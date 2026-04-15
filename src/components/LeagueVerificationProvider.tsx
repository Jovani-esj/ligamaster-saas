'use client';
import { useLeagueVerification } from '@/hooks/useLeagueVerification';

interface LeagueVerificationProviderProps {
  children: React.ReactNode;
}

export default function LeagueVerificationProvider({ children }: LeagueVerificationProviderProps) {
  const { verificationResult, loading } = useLeagueVerification();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando liga...</p>
        </div>
      </div>
    );
  }

  // Si hay un error de verificación que requiere redirección, el hook ya maneja la redirección
  if (verificationResult && !verificationResult.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
