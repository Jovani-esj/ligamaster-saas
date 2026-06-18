'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Trophy, Lock, CheckCircle, Eye, EyeOff, XCircle } from 'lucide-react';
import { toast } from 'sonner';

function RestablecerContraseñaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    setIsValid(!!token);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = searchParams.get('token');
    
    if (!token) {
      toast.error('Token inválido o expirado');
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        toast.error('Error al restablecer contraseña: ' + error.message);
      } else {
        setIsSuccess(true);
        toast.success('¡Contraseña restablecida exitosamente!');
      }
    } catch (error) {
      toast.error('Error inesperado. Por favor intenta nuevamente.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex flex-col justify-center items-center py-16 px-4">
        <div className="text-center mb-8 max-w-sm">
          <Link href="/" className="inline-flex items-center space-x-3 mb-4 group">
            <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-all">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">LigaMaster</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight text-red-600">
            Enlace Inválido
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            El token de recuperación no es válido o ha expirado.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-md w-full p-8 space-y-6">
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-gray-600 text-sm">
              Por favor solicita un nuevo correo electrónico de recuperación de contraseña.
            </p>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => router.push('/auth/recuperar-contraseña')}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-red-500/20 transition-all duration-200"
              >
                Solicitar Nuevo Enlace
              </button>
              <button
                onClick={() => router.push('/auth/simple-login')}
                className="w-full py-3 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
              >
                Volver al Inicio de Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col justify-center items-center py-16 px-4">
        <div className="text-center mb-8 max-w-sm">
          <Link href="/" className="inline-flex items-center space-x-3 mb-4 group">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">LigaMaster</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight text-emerald-600">
            ¡Éxito!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Tu contraseña ha sido restablecida correctamente.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-md w-full p-8 space-y-6">
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-600 text-sm">
              Ahora puedes usar tu nueva contraseña para iniciar sesión.
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push('/auth/simple-login')}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all duration-200"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          Nueva Contraseña
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Ingresa tu nueva contraseña para actualizar tu cuenta.
        </p>
      </div>

      {/* Tarjeta de Formulario */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-md w-full p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Repite tu nueva contraseña"
                className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RestablecerContraseña() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <RestablecerContraseñaContent />
    </Suspense>
  );
}

