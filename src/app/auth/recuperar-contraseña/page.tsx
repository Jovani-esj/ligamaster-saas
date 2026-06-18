'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Trophy, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RecuperarContraseña() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/restablecer-contraseña`
      });

      if (error) {
        toast.error('Error al enviar email de recuperación: ' + error.message);
      } else {
        setSubmitted(true);
        toast.success('Email de recuperación enviado. Revisa tu bandeja de entrada.');
      }
    } catch (error) {
      toast.error('Error inesperado. Por favor intenta nuevamente.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center items-center py-16 px-4">
      
      {/* Encabezado Principal */}
      <div className="text-center mb-8 max-w-sm">
        <Link href="/" className="inline-flex items-center space-x-3 mb-4 group">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
            <Trophy className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tight">LigaMaster</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
          Recuperar Contraseña
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Ingresa tu correo electrónico para enviarte un enlace de recuperación.
        </p>
      </div>

      {/* Tarjeta de Recuperación */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-md w-full p-8 space-y-6">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push('/auth/simple-login')}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Enlace'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              ¡Email Enviado!
            </h3>
            <p className="text-gray-600 text-sm">
              Hemos enviado un enlace de recuperación a <strong>{formData.email}</strong>
            </p>
            <p className="text-xs text-gray-400">
              Revisa tu bandeja de entrada y sigue las instrucciones para reestablecer tu contraseña.
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push('/auth/simple-login')}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
              >
                Volver al Inicio de Sesión
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 text-center">
          <p className="text-xs text-gray-500">
            ¿No tienes una cuenta?{' '}
            <Link href="/auth/simple-register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

