'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, Search, Users, TrendingUp, Star, ArrowRight, Shield, 
  Sparkles, CheckCircle2, ChevronRight, Activity, Calendar, DollarSign
} from 'lucide-react';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  estatus_pago: boolean;
  descripcion?: string;
  plan?: string;
}

export default function Home() {
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarLigas = async () => {
      try {
        const { data } = await supabase
          .from('ligas')
          .select('*')
          .eq('estatus_pago', true)
          .order('fecha_registro', { ascending: false })
          .limit(6);
        
        if (data) setLigas(data);
      } catch (err) {
        console.error('Error al cargar ligas:', err);
      } finally {
        setLoading(false);
      }
    };
    
    cargarLigas();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Hero Section Premium */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-28 px-4 sm:px-6 lg:px-8">
        {/* Efectos de luces de fondo */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plataforma Deportiva Todo-En-Uno</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Administra tu Liga Deportiva como un Profesional
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
              LigaMaster unifica la gestión de equipos, calendarios de juego round-robin, finanzas y estadísticas en una plataforma SaaS premium.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/auth/simple-register?role=admin_liga">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-6 px-8 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all cursor-pointer">
                  Crear Mi Liga (Admin)
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/simple-register?role=usuario">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl py-6 px-8 hover:scale-[1.02] transition-all cursor-pointer">
                  Registrarme como Jugador
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-12 bg-slate-900 text-slate-400 border-y border-slate-800/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-1.5">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">120+</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Ligas Activas</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">1,500+</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Equipos Registrados</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">25,000+</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Jugadores Activos</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">100,000+</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Partidos Programados</p>
            </div>
          </div>
        </div>
      </section>

      {/* Características Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-4.5xl font-black text-slate-900 tracking-tight">
            Todo lo necesario para tu torneo
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed font-medium">
            Herramientas robustas diseñadas tanto para directivos de ligas como para capitanes de equipos y jugadores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <Card className="border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 rounded-2xl bg-white overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Gestión de Equipos</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Control de registros, perfiles de jugadores, asignación de números de camiseta y roles capitulares de forma interactiva.
              </p>
            </div>
          </Card>

          <Card className="border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 rounded-2xl bg-white overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Calendarios Dinámicos</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Generación algorítmica de enfrentamientos de torneos Round Robin con gestión automática de canchas y horarios disponibles.
              </p>
            </div>
          </Card>

          <Card className="border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 rounded-2xl bg-white overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Modo SaaS Multi-Tenant</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Cada liga posee un subdominio y base de datos aislada, garantizando privacidad, seguridad y velocidad excepcionales.
              </p>
            </div>
          </Card>

        </div>
      </section>

      {/* Ligas Públicas Populares */}
      <section className="py-20 bg-slate-100/60 border-y border-slate-200/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ligas Destacadas</h2>
              <p className="text-slate-500 text-sm font-medium">Explora las ligas deportivas más activas del sistema.</p>
            </div>
            <Link href="/buscar">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-white rounded-xl py-5 hover:scale-[1.02] transition-all cursor-pointer">
                Explorar Todas las Ligas
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 animate-pulse">
                  <div className="h-4.5 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3.5 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-16 bg-slate-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : ligas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ligas.map((liga) => (
                <Link key={liga.id} href={`/${liga.slug}`}>
                  <Card className="bg-white border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-lg rounded-2xl hover:scale-[1.03] transition-all cursor-pointer overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-extrabold text-lg text-slate-900 line-clamp-1">{liga.nombre_liga}</h3>
                          <p className="text-xs text-blue-600 font-semibold mt-0.5">/{liga.slug}</p>
                        </div>
                        <Badge className="bg-green-50 text-green-700 border border-green-200 font-medium">Activa</Badge>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 h-8">
                        {liga.descripcion || 'Sin descripción disponible para esta liga deportiva.'}
                      </p>
                      <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-50">
                        <span className="font-medium text-slate-400">Plan {liga.plan || 'Bronce'}</span>
                        <span className="font-bold text-blue-600 flex items-center gap-1 group">
                          Ver detalles
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-slate-900 mb-1">Aún no hay ligas públicas</h4>
              <p className="text-slate-500 text-sm mb-6">Sé el primero en configurar una liga deportiva y ponerla en el mapa.</p>
              <Link href="/auth/simple-register?role=admin_liga">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Crear Primera Liga</Button>
              </Link>
            </div>
          )}

        </div>
      </section>

      {/* Planes y Precios Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold">Planes de Membresía</Badge>
          <h2 className="text-3.5xl md:text-4.5xl font-black text-slate-900 tracking-tight">Precios Transparentes para Todos</h2>
          <p className="text-slate-500 text-base font-medium">Registra tu perfil gratis para jugar o contrata un plan premium de administración.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* Card Jugador */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perfil de Usuario</span>
                <h3 className="text-xl font-extrabold text-slate-900">Jugador / Fan</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Perfecto para jugadores que desean unirse a equipos existentes o aficionados que quieren seguir estadísticas.</p>
              <div className="py-4 border-y border-slate-100">
                <span className="text-3xl font-black text-slate-900">$0</span>
                <span className="text-xs text-slate-400 font-medium"> USD/mes</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Explorar ligas de tu ciudad</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Solicitud de ingreso a equipos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Ficha de jugador y perfil personal</span>
                </li>
              </ul>
            </div>
            <Link href="/auth/simple-register?role=usuario" className="mt-8">
              <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl py-5 font-semibold text-xs cursor-pointer">
                Registrarme Gratis
              </Button>
            </Link>
          </div>

          {/* Card Bronce */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Administradores</span>
                <h3 className="text-xl font-extrabold text-slate-900">Plan Bronce</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Excelente para ligas comunitarias o torneos pequeños de fin de semana que recién comienzan.</p>
              <div className="py-4 border-y border-slate-100">
                <span className="text-3xl font-black text-slate-900">$19</span>
                <span className="text-xs text-slate-400 font-medium"> USD/mes</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Soporte de hasta 8 equipos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1 Cancha en programación</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Algoritmo Round Robin completo</span>
                </li>
              </ul>
            </div>
            <Link href="/auth/simple-register?role=admin_liga" className="mt-8">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-5 font-semibold text-xs cursor-pointer">
                Contratar Bronce
              </Button>
            </Link>
          </div>

          {/* Card Plata (Destacado) */}
          <div className="bg-white border-2 border-blue-600 rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-blue-100 relative">
            <div className="absolute top-0 right-6 transform -translate-y-1/2">
              <Badge className="bg-blue-600 text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full">RECOMENDADO</Badge>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Administradores</span>
                <h3 className="text-xl font-extrabold text-slate-900">Plan Plata</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Ideal para ligas amateurs de tamaño medio que requieren mayor disponibilidad de canchas y estadísticas.</p>
              <div className="py-4 border-y border-slate-100">
                <span className="text-3xl font-black text-slate-900">$39</span>
                <span className="text-xs text-slate-400 font-medium"> USD/mes</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Soporte de hasta 16 equipos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Canchas e instalaciones ilimitadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Soporte y chat técnico</span>
                </li>
              </ul>
            </div>
            <Link href="/auth/simple-register?role=admin_liga" className="mt-8">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-5 font-semibold text-xs shadow-md shadow-blue-500/15 cursor-pointer">
                Contratar Plata
              </Button>
            </Link>
          </div>

          {/* Card Oro */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">Administradores</span>
                <h3 className="text-xl font-extrabold text-slate-900">Plan Oro</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Para organizaciones deportivas grandes que necesitan control total y equipos de manera ilimitada.</p>
              <div className="py-4 border-y border-slate-100">
                <span className="text-3xl font-black text-slate-900">$79</span>
                <span className="text-xs text-slate-400 font-medium"> USD/mes</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Equipos ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Cuentas para árbitros auxiliares</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dominio web personalizado</span>
                </li>
              </ul>
            </div>
            <Link href="/auth/simple-register?role=admin_liga" className="mt-8">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-5 font-semibold text-xs cursor-pointer">
                Contratar Oro
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-4xl font-black tracking-tight leading-tight">¿Estás listo para llevar tu liga al siguiente nivel?</h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto font-medium">Configura tus torneos, automatiza estadísticas y ofrece un portal premium a tus aficionados hoy mismo.</p>
          <div className="pt-6">
            <Link href="/auth/simple-register?role=admin_liga">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-6 px-10 rounded-xl shadow-xl hover:scale-[1.03] transition-all cursor-pointer">
                Comenzar Prueba Gratuita
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <Trophy className="h-7 w-7 text-blue-500" />
              <span className="text-xl font-bold tracking-tight">LigaMaster</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs">
              La plataforma líder para gestión deportiva amateur y profesional. Automatizando el deporte aficionado desde 2024.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Producto</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/caracteristicas" className="hover:text-white transition-colors">Características</Link></li>
              <li><Link href="/precios" className="hover:text-white transition-colors">Planes y Precios</Link></li>
              <li><Link href="/seguridad" className="hover:text-white transition-colors">Seguridad SaaS</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Compañía</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog Deportivo</Link></li>
              <li><Link href="/ayuda" className="hover:text-white transition-colors">Soporte Técnico</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/terminos" className="hover:text-white transition-colors">Términos de Servicio</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Preferencias de Cookies</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-900 mt-12 pt-8 text-center text-xs">
          <p>&copy; 2026 LigaMaster SaaS. Todos los derechos reservados. Diseñado para rendimiento máximo.</p>
        </div>
      </footer>

    </div>
  );
}

