'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { Trophy, Mail, Lock, Eye, EyeOff, ChevronDown, ChevronUp, KeyRound, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTestUsers, setShowTestUsers] = useState(false);
  
  const { signIn } = useSimpleAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const success = await signIn(email, password);
      
      if (success) {
        toast.success('¡Sesión iniciada correctamente!');
        router.push('/dashboard');
        // Forzar recarga leve para sincronizar el estado
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        setError('El correo o la contraseña son incorrectos.');
        toast.error('Error al iniciar sesión');
      }
    } catch (error) {
      setError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
      toast.error('Error en el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleTestUserLogin = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('123456');
    toast.success(`Datos de ${testEmail} cargados. Presiona Iniciar Sesión.`);
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
          Bienvenido de nuevo
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Ingresa tus credenciales para acceder a tu panel de control deportivo.
        </p>
      </div>

      {/* Tarjeta de Login */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-md w-full p-8 space-y-6">
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <Link href="/auth/recuperar-contraseña" className="text-xs font-semibold text-blue-600 hover:underline">
                ¿La olvidaste?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center text-xs text-red-600 font-medium animate-in fade-in duration-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center cursor-pointer hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4.5 w-4.5 border-b-2 border-white border-t-transparent"></div>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              <span className="flex items-center">
                Iniciar Sesión
                <ArrowRight className="w-4 h-4 ml-2" />
              </span>
            )}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              ¿No tienes una cuenta aún?{' '}
              <Link href="/auth/simple-register" className="font-semibold text-blue-600 hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>

        </form>

        {/* Acordeón de credenciales de prueba */}
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => setShowTestUsers(!showTestUsers)}
            className="w-full flex justify-between items-center py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 outline-none"
          >
            <span className="flex items-center">
              <KeyRound className="w-4 h-4 mr-1.5 text-gray-400" />
              Acceso Rápido (Cuentas de Prueba)
            </span>
            {showTestUsers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showTestUsers && (
            <div className="mt-3 bg-gray-50/50 border border-gray-100 rounded-xl p-3.5 space-y-2.5 animate-in slide-in-from-top-2 duration-300">
              <p className="text-[10px] text-gray-400 leading-normal mb-1">
                Haz clic en cualquier perfil para cargar sus credenciales automáticamente (la contraseña de todos es <span className="font-mono font-semibold">123456</span>):
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleTestUserLogin('superadmin@ligamaster.com')}
                  className="w-full flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/20 text-left transition-all text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">Super Administrador</span>
                    <span className="text-gray-500 text-[10px]">superadmin@ligamaster.com</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 -rotate-90" />
                </button>

                <button
                  type="button"
                  onClick={() => handleTestUserLogin('mindostech@gmail.com')}
                  className="w-full flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/20 text-left transition-all text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">Admin General (Master)</span>
                    <span className="text-gray-500 text-[10px]">mindostech@gmail.com</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 -rotate-90" />
                </button>

                <button
                  type="button"
                  onClick={() => handleTestUserLogin('admin.liga@ejemplo.com')}
                  className="w-full flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/20 text-left transition-all text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">Admin de Liga</span>
                    <span className="text-gray-500 text-[10px]">admin.liga@ejemplo.com</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 -rotate-90" />
                </button>

                <button
                  type="button"
                  onClick={() => handleTestUserLogin('capitan.equipo@ejemplo.com')}
                  className="w-full flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/20 text-left transition-all text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">Capitán de Equipo</span>
                    <span className="text-gray-500 text-[10px]">capitan.equipo@ejemplo.com</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 -rotate-90" />
                </button>

                <button
                  type="button"
                  onClick={() => handleTestUserLogin('usuario@ejemplo.com')}
                  className="w-full flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/20 text-left transition-all text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">Usuario Regular (Jugador)</span>
                    <span className="text-gray-500 text-[10px]">usuario@ejemplo.com</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 -rotate-90" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

