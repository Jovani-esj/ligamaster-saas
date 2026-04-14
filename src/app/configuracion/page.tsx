'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Shield, 
  User, 
  Globe, 
  Moon, 
  ArrowLeft,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    theme: 'light',
    language: 'es',
    timezone: 'America/Mexico_City'
  });

  useEffect(() => {
    const cargarConfiguracion = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('settings')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error al cargar configuración:', error);
        } else if (data?.settings) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Error inesperado:', error);
      }
    };

    cargarConfiguracion();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ settings })
        .eq('user_id', user.id);

      if (error) {
        toast.error('Error al guardar configuración: ' + error.message);
      } else {
        toast.success('¡Configuración guardada exitosamente!');
      }
    } catch (error) {
      toast.error('Error inesperado al guardar configuración');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    setSettings(prev => ({ ...prev, theme: newTheme }));
    
    // Apply theme immediately
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/perfil"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Perfil
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuración
            </h1>
            <p className="text-lg text-gray-600">
              Personaliza tu experiencia en LigaMaster
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notificaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Preferencias de Notificación
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_notifications">Email</Label>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, email_notifications: !prev.email_notifications }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        settings.email_notifications
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span className="sr-only">Toggle email notifications</span>
                      <span
                        aria-hidden="true"
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition-transform ${
                          settings.email_notifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push_notifications">Push</Label>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, push_notifications: !prev.push_notifications }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        settings.push_notifications
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span className="sr-only">Toggle push notifications</span>
                      <span
                        aria-hidden="true"
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition-transform ${
                          settings.push_notifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms_notifications">SMS</Label>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, sms_notifications: !prev.sms_notifications }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        settings.sms_notifications
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span className="sr-only">Toggle SMS notifications</span>
                      <span
                        aria-hidden="true"
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition-transform ${
                          settings.sms_notifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-gray-600 mb-4">
                  Las notificaciones te mantendrán al día con las últimas actualizaciones de tus ligas y partidos.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    <Bell className="w-4 h-4 mr-2" />
                    Ver Historial
                  </Button>
                  <Button className="flex-1">
                    <Shield className="w-4 h-4 mr-2" />
                    Configurar Alertas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apariencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Apariencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personalización
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="theme">Tema</Label>
                    <select
                      id="theme"
                      value={settings.theme}
                      onChange={(e) => {
                        setSettings(prev => ({ ...prev, theme: e.target.value }));
                        handleThemeToggle();
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro</option>
                      <option value="auto">Automático</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="language">Idioma</Label>
                    <select
                      id="language"
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">Zona Horaria</Label>
                    <select
                      id="timezone"
                      value={settings.timezone}
                      onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="America/Mexico_City">Ciudad de México</option>
                      <option value="America/New_York">Nueva York</option>
                      <option value="America/Los_Angeles">Los Ángeles</option>
                      <option value="Europe/Madrid">Madrid</option>
                      <option value="Asia/Tokyo">Tokio</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-gray-600 mb-4">
                  Personaliza la apariencia de LigaMaster según tus preferencias.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    <Moon className="w-4 h-4 mr-2" />
                    Modo Oscuro
                  </Button>
                  <Button className="flex-1">
                    <Globe className="w-4 h-4 mr-2" />
                    Personalizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Configuración de Seguridad
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Contraseña</h4>
                      <p className="text-sm text-gray-600">
                        Última actualización: Hace 30 días
                      </p>
                    </div>
                    <Button variant="outline">
                      Cambiar Contraseña
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Autenticación de Dos Factores</h4>
                      <p className="text-sm text-gray-600">
                        Añade una capa extra de seguridad a tu cuenta
                      </p>
                    </div>
                    <Button variant="outline">
                      Configurar 2FA
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Sesiones Activas</h4>
                      <p className="text-sm text-gray-600">
                        3 dispositivos conectados
                      </p>
                    </div>
                    <Button variant="outline">
                      Gestionar Sesiones
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-gray-600 mb-4">
                  Mantén tu cuenta segura con estas configuraciones de seguridad recomendadas.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    <Shield className="w-4 h-4 mr-2" />
                    Centro de Seguridad
                  </Button>
                  <Button className="flex-1">
                    <User className="w-4 h-4 mr-2" />
                    Actividad de Cuenta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Guardar Cambios
                  </h3>
                  <p className="text-sm text-gray-600">
                    Los cambios se guardarán automáticamente
                  </p>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
