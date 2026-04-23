'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, ArrowLeft, CheckCircle, Shield, Users, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import RouteProtection from '@/components/auth/RouteProtection';

export default function CrearLiga() {
  const router = useRouter();
  const { user, profile } = useSimpleAuth();
  const [formData, setFormData] = useState({
    nombre_liga: '',
    slug: '',
    descripcion: '',
    estatus_pago: true,
    plan: 'Bronce'
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    ligasCreadas: 0,
    maxLigas: 3
  });

  // Cargar estadísticas del usuario
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user?.id) return;
      
      const { count } = await supabase
        .from('ligas')
        .select('*', { count: 'exact', head: true })
        .or(`owner_id.eq.${user.id},creado_por.eq.${user.id}`);
      
      setStats(prev => ({
        ...prev,
        ligasCreadas: count || 0
      }));
    };
    
    loadUserStats();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_liga || !formData.slug) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    if (!user?.id) {
      toast.error('Debes iniciar sesión para crear una liga');
      return;
    }

    // Verificar límite de ligas
    if (stats.ligasCreadas >= stats.maxLigas && profile?.rol !== 'superadmin') {
      toast.error(`Has alcanzado el límite de ${stats.maxLigas} ligas. Contacta al administrador.`);
      return;
    }

    setLoading(true);
    
    try {
      const ligaData = {
        nombre_liga: formData.nombre_liga,
        slug: formData.slug,
        descripcion: formData.descripcion,
        estatus_pago: formData.estatus_pago,
        plan: formData.plan,
        owner_id: user.id,
        activa: true,
        fecha_registro: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ligas')
        .insert([ligaData])
        .select()
        .single();

      if (error) {
        if (error.message.includes('duplicate key') || error.message.includes('slug')) {
          toast.error('El slug ya existe. Intenta con otro nombre.');
        } else {
          toast.error('Error al crear la liga: ' + error.message);
        }
      } else {
        toast.success('¡Liga creada exitosamente! Ahora puedes gestionarla desde "Mis Ligas"');
        router.push('/mis-ligas');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado al crear la liga');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (nombre: string) => {
    return nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNombreChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      nombre_liga: value,
      slug: generateSlug(value)
    }));
  };

  // Si no está autenticado, mostrar mensaje
  if (!user) {
    return (
      <RouteProtection requireAuth={true}>
        <div />
      </RouteProtection>
    );
  }

  return (
    <RouteProtection requireAuth={true}>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          
          <div className="text-center">
            <Trophy className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Crear Nueva Liga
            </h1>
            <p className="text-lg text-gray-600">
              Configura tu liga en minutos y empieza a gestionar tus torneos
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Información de la Liga</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nombre_liga" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Liga *
                </label>
                <Input
                  id="nombre_liga"
                  type="text"
                  value={formData.nombre_liga}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNombreChange(e.target.value)}
                  placeholder="Ej: Liga Premier Fútbol"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la Liga *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    /
                  </span>
                  <Input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="liga-premier-futbol"
                    className="pl-8 w-full"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Esta será la URL pública de tu liga
                </p>
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe tu liga, tipo de deporte, número de equipos, etc."
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Selector de Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan de la Liga
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['Bronce', 'Plata', 'Oro'].map((plan) => (
                    <button
                      key={plan}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, plan }))}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        formData.plan === plan
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Trophy className={`w-6 h-6 mx-auto mb-2 ${
                        plan === 'Oro' ? 'text-yellow-500' :
                        plan === 'Plata' ? 'text-gray-500' :
                        'text-orange-500'
                      }`} />
                      <p className="font-medium">{plan}</p>
                      <p className="text-xs text-gray-500">
                        {plan === 'Bronce' && 'Hasta 8 equipos'}
                        {plan === 'Plata' && 'Hasta 16 equipos'}
                        {plan === 'Oro' && 'Equipos ilimitados'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="estatus_pago"
                  checked={formData.estatus_pago}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, estatus_pago: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="estatus_pago" className="text-sm text-gray-700">
                  Activar liga inmediatamente (prueba gratuita)
                </label>
              </div>

              {/* Info del creador */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    <strong>Propietario:</strong> Tú serás el administrador de esta liga automáticamente.
                    Podrás gestionar equipos, jugadores, partidos y configuraciones.
                  </p>
                </div>
              </div>

              {/* Stats de ligas */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Ligas creadas:</strong> {stats.ligasCreadas} de {stats.maxLigas}
                  {profile?.rol === 'superadmin' && ' (Ilimitado)'}
                </p>
                {stats.ligasCreadas >= stats.maxLigas && profile?.rol !== 'superadmin' && (
                  <p className="text-sm text-red-600 mt-1">
                    Has alcanzado el límite de ligas.
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/mis-ligas')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || (stats.ligasCreadas >= stats.maxLigas && profile?.rol !== 'superadmin')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Creando...' : 'Crear Liga'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Gestión de Equipos</h3>
              <p className="text-sm text-gray-600">
                Registra equipos, jugadores y estadísticas en tiempo real
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Calendario Automático</h3>
              <p className="text-sm text-gray-600">
                Genera calendarios con algoritmo Round Robin
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Sitio Público</h3>
              <p className="text-sm text-gray-600">
                Portal para que tus seguidores vean resultados
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </RouteProtection>
  );
}
