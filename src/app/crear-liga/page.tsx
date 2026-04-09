'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CrearLiga() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre_liga: '',
    slug: '',
    descripcion: '',
    estatus_pago: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_liga || !formData.slug) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('ligas')
        .insert([formData]);

      if (error) {
        toast.error('Error al crear la liga: ' + error.message);
      } else {
        toast.success('¡Liga creada exitosamente!');
        router.push(`/${formData.slug}`);
      }
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

  return (
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

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
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
  );
}
