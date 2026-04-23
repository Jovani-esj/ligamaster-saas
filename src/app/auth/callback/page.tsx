'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code from the URL
        const code = searchParams.get('code');
        
        if (code) {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Error exchanging code for session:', error);
            toast.error('Error al autenticar con Facebook');
            router.push('/auth/login');
            return;
          }

          if (data.user) {
            // Check if user profile exists, create if not
            const { data: existingProfile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', data.user.id)
              .single();

            if (!existingProfile) {
              // Create user profile for OAuth user
              const { error: profileError } = await supabase
                .from('user_profiles')
                .insert([{
                  user_id: data.user.id,
                  nombre: data.user.user_metadata?.full_name?.split(' ')[0] || data.user.user_metadata?.name || 'Usuario',
                  apellido: data.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                  rol: 'usuario',
                  activo: true
                }]);

              if (profileError) {
                console.error('Error creating user profile:', profileError);
                toast.error('Error al crear perfil de usuario');
              }
            }

            toast.success('¡Autenticación con Facebook exitosa!');
            router.push('/');
          }
        } else {
          toast.error('No se encontró código de autenticación');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        toast.error('Error durante la autenticación');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Autenticando con Facebook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}
