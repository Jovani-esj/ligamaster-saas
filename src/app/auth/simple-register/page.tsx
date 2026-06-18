'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { 
  Trophy, User, Users, Mail, Lock, Phone, Calendar, 
  CreditCard, Shield, ChevronRight, ChevronLeft, CheckCircle, 
  Sparkles, DollarSign, Activity, Target, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useSimpleAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    // Step 1: Cuenta
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Personal & Rol
    nombre: '',
    apellido: '',
    telefono: '',
    fecha_nacimiento: '',
    rol: 'usuario', // 'usuario' | 'admin_liga'
    // Step 3 (Jugador): Detalles extra
    deporte_preferido: 'Fútbol',
    nivel_juego: 'Intermedio',
    equipo_interes: '',
    posicion_preferida: '',
    // Step 3 (Admin): Detalles de Liga
    nombre_liga: '',
    slug_liga: '',
    descripcion_liga: '',
    plan_liga: 'Plata', // 'Bronce' | 'Plata' | 'Oro'
    // Step 4 (Admin): Pago
    tarjeta_numero: '',
    tarjeta_nombre: '',
    tarjeta_expira: '',
    tarjeta_cvv: '',
  });

  // Pre-seleccionar rol si viene de la URL
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin_liga' || roleParam === 'usuario') {
      setFormData(prev => ({ ...prev, rol: roleParam }));
    }
  }, [searchParams]);

  // Generar Slug de Liga automáticamente a partir del nombre de la liga
  useEffect(() => {
    if (formData.nombre_liga) {
      const slug = formData.nombre_liga
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^a-z0-9\s-]/g, '')    // Mantener sólo letras, números y espacios
        .trim()
        .replace(/\s+/g, '-');          // Espacios a guiones
      setFormData(prev => ({ ...prev, slug_liga: slug }));
    }
  }, [formData.nombre_liga]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role: 'usuario' | 'admin_liga') => {
    setFormData(prev => ({ ...prev, rol: role }));
  };

  const handlePlanSelect = (plan: 'Bronce' | 'Plata' | 'Oro') => {
    setFormData(prev => ({ ...prev, plan_liga: plan }));
  };

  // Obtener precio del plan seleccionado
  const getPlanPrice = () => {
    if (formData.plan_liga === 'Bronce') return 19;
    if (formData.plan_liga === 'Plata') return 39;
    return 79;
  };

  const handleNext = () => {
    // Validaciones por paso
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
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
    } else if (step === 2) {
      if (!formData.nombre || !formData.apellido) {
        toast.error('Nombre y apellido son obligatorios');
        return;
      }
    } else if (step === 3 && formData.rol === 'admin_liga') {
      if (!formData.nombre_liga || !formData.slug_liga) {
        toast.error('El nombre y la URL de la liga son obligatorios');
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación final para admin
    if (formData.rol === 'admin_liga') {
      if (!formData.tarjeta_numero || !formData.tarjeta_expira || !formData.tarjeta_cvv || !formData.tarjeta_nombre) {
        toast.error('Por favor completa los detalles de pago');
        return;
      }
    }

    setLoading(true);

    // Preparar datos extra según el rol
    const extraData: Record<string, any> = {
      rol: formData.rol,
      telefono: formData.telefono || null,
      fecha_nacimiento: formData.fecha_nacimiento || null,
    };

    if (formData.rol === 'usuario') {
      extraData.deporte_preferido = formData.deporte_preferido;
      extraData.nivel_juego = formData.nivel_juego;
      extraData.equipo_interes = formData.equipo_interes || null;
      extraData.posicion_preferida = formData.posicion_preferida || null;
    } else {
      extraData.nombre_liga = formData.nombre_liga;
      extraData.slug_liga = formData.slug_liga;
      extraData.descripcion_liga = formData.descripcion_liga || null;
      extraData.plan_liga = formData.plan_liga;
      extraData.monto_pago = getPlanPrice().toString();
      extraData.referencia_pago = `SIM-PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    try {
      // Simular retraso de procesamiento para darle realismo al checkout
      await new Promise(resolve => setTimeout(resolve, 2000));

      const signupSuccess = await signUp(
        formData.email,
        formData.password,
        formData.nombre,
        formData.apellido,
        extraData
      );

      if (signupSuccess) {
        toast.success('¡Registro completado con éxito!');
        setSuccess(true);
      } else {
        toast.error('Error al registrarse. Posiblemente el email ya esté en uso.');
      }
    } catch (err) {
      toast.error('Ocurrió un error inesperado al procesar el registro.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar contenido de éxito
  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center max-w-lg mx-auto transform transition-all animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
          <CheckCircle className="w-12 h-12" />
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
          ¡Registro Exitoso!
        </h2>
        
        <p className="text-gray-600 mb-8">
          Hola <span className="font-semibold text-gray-900">{formData.nombre}</span>, tu cuenta en LigaMaster ha sido creada de manera exitosa.
          {formData.rol === 'admin_liga' ? (
            <>
              <br />
              Hemos procesado tu pago simulado de <span className="font-bold text-blue-600">${getPlanPrice()}.00 USD</span> para el plan {formData.plan_liga}. 
              Tu liga <span className="font-semibold text-gray-900">"{formData.nombre_liga}"</span> está lista para configurarse.
            </>
          ) : (
            <>
              <br />
              Ya tienes acceso como jugador en la plataforma para explorar ligas, unirte a equipos y ver tus estadísticas.
            </>
          )}
        </p>

        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-8 text-left text-sm text-blue-800 flex items-start">
          <Sparkles className="w-5 h-5 mr-3 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Siguiente paso sugerido:</span>
            <p className="mt-1">
              {formData.rol === 'admin_liga' 
                ? 'Ve al panel de control de tu liga para agregar canchas, crear tu primer torneo e invitar equipos.'
                : 'Explora la sección de ligas para buscar torneos activos cerca de ti o solicita unirte a tu equipo.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            router.push('/dashboard');
            // Forzar recarga leve para sincronizar el estado
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.02]"
        >
          Ir a mi Panel de Control
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-xl w-full mx-auto transition-all duration-300">
      
      {/* Barra de Progreso */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-800 text-sm">Registro Unificado LigaMaster</span>
        </div>
        <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Paso {step} de {formData.rol === 'admin_liga' ? 4 : 3}
        </div>
      </div>

      <div className="w-full bg-gray-100 h-1">
        <div 
          className="bg-blue-600 h-1 transition-all duration-300" 
          style={{ width: `${(step / (formData.rol === 'admin_liga' ? 4 : 3)) * 100}%` }}
        />
      </div>

      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 border-t-transparent mb-6"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {formData.rol === 'admin_liga' && step === 4 ? 'Procesando pago seguro...' : 'Creando tu cuenta...'}
          </h3>
          <p className="text-gray-500 text-sm max-w-xs">
            Por favor espera un momento mientras configuramos tu espacio de trabajo en la plataforma.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* PASO 1: CREAR CUENTA */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Comencemos con tu cuenta</h3>
                <p className="text-gray-500 text-sm mt-1">Ingresa tus credenciales básicas de acceso</p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repite tu contraseña"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: INFO PERSONAL Y TIPO DE ROL */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Cuéntanos sobre ti</h3>
                <p className="text-gray-500 text-sm mt-1">Completa tus datos personales y escoge tu perfil</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Juan"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    required
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Pérez"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="+52 555-1234"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Selector de Rol */}
              <div className="space-y-2 pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué tipo de cuenta necesitas? *</label>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Jugador Card */}
                  <div
                    onClick={() => handleRoleSelect('usuario')}
                    className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col justify-between transition-all ${
                      formData.rol === 'usuario'
                        ? 'border-blue-600 bg-blue-50/40 shadow-md shadow-blue-100'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        formData.rol === 'usuario' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Users className="w-5 h-5" />
                      </div>
                      {formData.rol === 'usuario' && (
                        <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-950 text-sm">Jugador o Espectador</h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        Accede a ligas, únete a equipos y revisa estadísticas de partidos.
                      </p>
                      <span className="inline-block mt-3 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                        GRATIS
                      </span>
                    </div>
                  </div>

                  {/* Admin Liga Card */}
                  <div
                    onClick={() => handleRoleSelect('admin_liga')}
                    className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col justify-between transition-all ${
                      formData.rol === 'admin_liga'
                        ? 'border-blue-600 bg-blue-50/40 shadow-md shadow-blue-100'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        formData.rol === 'admin_liga' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Trophy className="w-5 h-5" />
                      </div>
                      {formData.rol === 'admin_liga' && (
                        <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-950 text-sm">Administrador de Liga</h4>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        Crea y administra tus propios torneos, canchas, calendarios y finanzas.
                      </p>
                      <span className="inline-block mt-3 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        DE PAGO (Suscripción)
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* PASO 3 PARA JUGADOR: CAMPOS ADICIONALES */}
          {step === 3 && formData.rol === 'usuario' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Opciones Adicionales</h3>
                <p className="text-gray-500 text-sm mt-1">Personaliza tu perfil deportivo para los equipos</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Deporte de Preferencia</label>
                  <select
                    name="deporte_preferido"
                    value={formData.deporte_preferido}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                  >
                    <option value="Fútbol">Fútbol</option>
                    <option value="Fútbol 7">Fútbol 7</option>
                    <option value="Básquetbol">Básquetbol</option>
                    <option value="Voleibol">Voleibol</option>
                    <option value="Béisbol">Béisbol</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Nivel de Juego</label>
                  <select
                    name="nivel_juego"
                    value={formData.nivel_juego}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                  >
                    <option value="Principiante">Principiante (Recreativo)</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado (Competitivo)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Posición de Juego Preferida</label>
                <div className="relative">
                  <Target className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                  <input
                    type="text"
                    name="posicion_preferida"
                    value={formData.posicion_preferida}
                    onChange={handleChange}
                    placeholder="Ej: Delantero, Portero, Base, Armador"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">¿Tienes un equipo/liga de interés?</label>
                <div className="relative">
                  <Activity className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                  <input
                    type="text"
                    name="equipo_interes"
                    value={formData.equipo_interes}
                    onChange={handleChange}
                    placeholder="Ej: Rayados FC, Liga Toluca"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <p className="text-[11px] text-gray-500">Te ayudaremos a contactar con la liga o el capitán de este equipo.</p>
              </div>
            </div>
          )}

          {/* PASO 3 PARA ADMIN DE LIGA: DATOS DE LIGA Y PLAN */}
          {step === 3 && formData.rol === 'admin_liga' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-5">
                <h3 className="text-2xl font-bold text-gray-900">Configura tu Primera Liga</h3>
                <p className="text-gray-500 text-sm mt-1">Llene los detalles y elija el plan que mejor se adapte</p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Nombre de la Liga *</label>
                <input
                  type="text"
                  name="nombre_liga"
                  required
                  value={formData.nombre_liga}
                  onChange={handleChange}
                  placeholder="Ej: Liga Premier Fútbol Toluca"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Enlace Público de la Liga (URL Slug) *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-gray-500 text-sm font-medium select-none">/</span>
                  <input
                    type="text"
                    name="slug_liga"
                    required
                    value={formData.slug_liga}
                    onChange={handleChange}
                    placeholder="liga-premier-futbol-toluca"
                    className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Esta será la URL pública donde los jugadores verán estadísticas y roles.</p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                <textarea
                  name="descripcion_liga"
                  value={formData.descripcion_liga}
                  onChange={handleChange}
                  placeholder="Ej: Torneos de fin de semana para categoría libre y veteranos..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                />
              </div>

              {/* Selector de Plan */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Selecciona tu Plan Mensual *</label>
                <div className="grid grid-cols-3 gap-3">
                  
                  {/* Bronce */}
                  <div
                    onClick={() => handlePlanSelect('Bronce')}
                    className={`border-2 rounded-xl p-3 cursor-pointer text-center transition-all ${
                      formData.plan_liga === 'Bronce'
                        ? 'border-blue-600 bg-blue-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Trophy className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                    <h5 className="font-bold text-gray-900 text-xs">Bronce</h5>
                    <p className="text-[10px] text-gray-500">Hasta 8 Equipos</p>
                    <p className="font-bold text-gray-900 text-sm mt-2">$19<span className="text-[10px] font-normal text-gray-500">/m</span></p>
                  </div>

                  {/* Plata */}
                  <div
                    onClick={() => handlePlanSelect('Plata')}
                    className={`border-2 rounded-xl p-3 cursor-pointer text-center transition-all ${
                      formData.plan_liga === 'Plata'
                        ? 'border-blue-600 bg-blue-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Trophy className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                    <h5 className="font-bold text-gray-900 text-xs">Plata</h5>
                    <p className="text-[10px] text-gray-500">Hasta 16 Equipos</p>
                    <p className="font-bold text-gray-900 text-sm mt-2">$39<span className="text-[10px] font-normal text-gray-500">/m</span></p>
                  </div>

                  {/* Oro */}
                  <div
                    onClick={() => handlePlanSelect('Oro')}
                    className={`border-2 rounded-xl p-3 cursor-pointer text-center transition-all ${
                      formData.plan_liga === 'Oro'
                        ? 'border-blue-600 bg-blue-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                    <h5 className="font-bold text-gray-900 text-xs">Oro</h5>
                    <p className="text-[10px] text-gray-500">Ilimitados</p>
                    <p className="font-bold text-gray-900 text-sm mt-2">$79<span className="text-[10px] font-normal text-gray-500">/m</span></p>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* PASO 4 PARA ADMIN DE LIGA: PAGO SIMULADO */}
          {step === 4 && formData.rol === 'admin_liga' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-5">
                <h3 className="text-2xl font-bold text-gray-900">Pasarela de Pago Seguro</h3>
                <p className="text-gray-500 text-sm mt-1">Completa tu suscripción del Plan {formData.plan_liga}</p>
              </div>

              {/* Tarjeta Visual Simula */}
              <div className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg space-y-6 select-none relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-4 translate-x-4">
                  <CreditCard className="w-48 h-48" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider opacity-85">Suscripción SaaS</span>
                  <Trophy className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs opacity-60">Número de Tarjeta</p>
                  <p className="text-xl font-mono tracking-widest">
                    {formData.tarjeta_numero ? formData.tarjeta_numero.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                  </p>
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="text-[9px] opacity-60 uppercase">Titular</p>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {formData.tarjeta_nombre || `${formData.nombre} ${formData.apellido}`.trim() || 'NOMBRE DEL TITULAR'}
                    </p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p className="text-[9px] opacity-60 uppercase">Expiración</p>
                    <p className="text-sm font-mono">{formData.tarjeta_expira || 'MM/AA'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex items-start text-xs text-yellow-800">
                <ShieldAlert className="w-5 h-5 text-yellow-600 mr-2.5 shrink-0 mt-0.5" />
                <p>
                  <strong>Simulación de Pago:</strong> Puedes ingresar cualquier número ficticio. El sistema aprobará la transacción de manera inmediata.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Nombre en la Tarjeta *</label>
                  <input
                    type="text"
                    name="tarjeta_nombre"
                    required
                    value={formData.tarjeta_nombre}
                    onChange={handleChange}
                    placeholder="Ej: Carlos Rodríguez"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Número de Tarjeta *</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                    <input
                      type="text"
                      name="tarjeta_numero"
                      required
                      maxLength={16}
                      value={formData.tarjeta_numero}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData(prev => ({ ...prev, tarjeta_numero: val }));
                      }}
                      placeholder="4000123456789010"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Expiración (MM/AA) *</label>
                    <input
                      type="text"
                      name="tarjeta_expira"
                      required
                      maxLength={5}
                      value={formData.tarjeta_expira}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) {
                          val = val.substring(0, 2) + '/' + val.substring(2, 4);
                        }
                        setFormData(prev => ({ ...prev, tarjeta_expira: val }));
                      }}
                      placeholder="12/29"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Código CVV *</label>
                    <input
                      type="password"
                      name="tarjeta_cvv"
                      required
                      maxLength={4}
                      value={formData.tarjeta_cvv}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData(prev => ({ ...prev, tarjeta_cvv: val }));
                      }}
                      placeholder="123"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Detalles del Cargo */}
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Total a pagar:</span>
                <span className="text-2xl font-bold text-gray-900 flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-500 shrink-0" />
                  {getPlanPrice()}.00 <span className="text-xs text-gray-500 font-normal ml-1">USD/mes</span>
                </span>
              </div>
            </div>
          )}

          {/* BOTONES DE NAVEGACIÓN */}
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Atrás
              </button>
            )}

            {/* Si es el último paso, botón submit, si no, botón siguiente */}
            {(formData.rol === 'usuario' && step === 3) || (formData.rol === 'admin_liga' && step === 4) ? (
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/10 transition-all flex items-center justify-center cursor-pointer hover:scale-[1.01]"
              >
                {formData.rol === 'admin_liga' ? (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pagar y Registrarse
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completar Registro
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer hover:scale-[1.01]"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/auth/simple-login" className="font-semibold text-blue-600 hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>

        </form>
      )}
    </div>
  );
}

export default function SimpleRegisterPage() {
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
          Crea tu Cuenta
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Únete a la plataforma profesional de gestión deportiva más avanzada.
        </p>
      </div>

      {/* Formulario */}
      <Suspense fallback={
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center max-w-xl w-full flex flex-col items-center justify-center min-h-[350px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-sm mt-4">Cargando formulario...</p>
        </div>
      }>
        <RegisterForm />
      </Suspense>

      {/* Footer del registro */}
      <div className="text-center mt-8 text-xs text-gray-400 max-w-xs leading-normal">
        Al registrarte, aceptas nuestros{' '}
        <Link href="/terminos" className="hover:text-gray-600 underline">
          Términos de Servicio
        </Link>{' '}
        y la{' '}
        <Link href="/privacidad" className="hover:text-gray-600 underline">
          Política de Privacidad
        </Link>.
      </div>

    </div>
  );
}

