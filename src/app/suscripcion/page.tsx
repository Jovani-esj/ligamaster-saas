'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, AlertCircle, CheckCircle2, CreditCard, Clock, Calendar } from 'lucide-react';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import { supabase } from '@/lib/supabase';
import { Liga } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentModal } from '@/components/ui/PaymentModal';
import { toast } from 'sonner';

export default function SuscripcionPage() {
  const { user, profile } = useSimpleAuth();
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedLigaForPayment, setSelectedLigaForPayment] = useState<Liga | null>(null);

  const preciosPorPlan = {
    'Bronce': 100,
    'Plata': 200,
    'Oro': 500
  };

  const isRestricted = !profile || (profile.rol !== 'admin_liga' && profile.rol !== 'adminadmin' && profile.rol !== 'superadmin');

  const cargarLigas = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('ligas')
        .select('*')
        .eq('owner_id', user.id)
        .order('fecha_registro', { ascending: false });

      if (error) throw error;
      setLigas(data || []);
    } catch (error) {
      console.error('Error cargando ligas:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && !isRestricted) {
      cargarLigas();
    } else {
      setLoading(false);
    }
  }, [user, isRestricted, cargarLigas]);

  const handlePagarSuscripcion = (liga: Liga) => {
    setSelectedLigaForPayment(liga);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedLigaForPayment) return;
    
    try {
      // Calcular nueva fecha de vencimiento (1 mes más)
      const nuevaFecha = new Date();
      nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);

      const { error } = await supabase
        .from('ligas')
        .update({
          estatus_pago: true,
          fecha_vencimiento: nuevaFecha.toISOString()
        })
        .eq('id', selectedLigaForPayment.id);

      if (error) throw error;
      
      toast.success(`La suscripción de ${selectedLigaForPayment.nombre_liga} ha sido renovada.`);
      setIsPaymentModalOpen(false);
      setSelectedLigaForPayment(null);
      await cargarLigas();
    } catch (error) {
      console.error('Error actualizando suscripción:', error);
      toast.error('Error al actualizar el estado de la suscripción.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isRestricted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
          <p className="text-gray-600">
            Solo los administradores de liga pueden gestionar sus suscripciones.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Suscripciones y Facturación
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona los planes de tus ligas para mantenerlas activas en la plataforma.
          </p>
        </div>

        {ligas.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No tienes ligas registradas</h2>
              <p className="text-gray-600">Crea una liga primero para poder gestionar su suscripción.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ligas.map(liga => {
              const precioMensual = preciosPorPlan[liga.plan as keyof typeof preciosPorPlan] || 0;
              const estaAlDia = liga.estatus_pago;
              
              // Simular alerta de vencimiento próximo si la fecha de vencimiento es pronto
              const fechaVencimiento = liga.fecha_vencimiento ? new Date(liga.fecha_vencimiento) : null;
              const diasParaVencer = fechaVencimiento 
                ? Math.ceil((fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                : 0;
              const porVencer = estaAlDia && diasParaVencer > 0 && diasParaVencer <= 5;

              return (
                <Card key={liga.id} className={`overflow-hidden border-2 ${!estaAlDia ? 'border-red-200' : porVencer ? 'border-yellow-200' : 'border-transparent'}`}>
                  <div className={`h-2 w-full ${!estaAlDia ? 'bg-red-500' : porVencer ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={
                        liga.plan === 'Oro' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        liga.plan === 'Plata' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                        'bg-orange-100 text-orange-800 border-orange-200'
                      }>
                        Plan {liga.plan}
                      </Badge>
                      {estaAlDia ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 flex gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Activa
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 border-red-200 flex gap-1">
                          <AlertCircle className="w-3 h-3" /> Suspendida
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{liga.nombre_liga}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <span className="font-semibold text-gray-900">${precioMensual}</span> / mes
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex justify-between items-center text-gray-600">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Vencimiento</span>
                        <span className="font-medium text-gray-900">
                          {fechaVencimiento ? fechaVencimiento.toLocaleDateString('es-MX') : 'No registrada'}
                        </span>
                      </div>
                      
                      {porVencer && (
                        <div className="flex items-start gap-2 text-yellow-700 bg-yellow-50 p-2 rounded">
                          <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>Vence en {diasParaVencer} días. Renueva para evitar suspensión.</span>
                        </div>
                      )}

                      {!estaAlDia && (
                        <div className="flex items-start gap-2 text-red-700 bg-red-50 p-2 rounded">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>Tu liga no es visible para jugadores por falta de pago.</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2">
                    <Button 
                      className={`w-full font-semibold ${estaAlDia && !porVencer ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'}`}
                      onClick={() => handlePagarSuscripcion(liga)}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {estaAlDia && !porVencer ? 'Adelantar Pago' : 'Pagar Suscripción'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {selectedLigaForPayment && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedLigaForPayment(null);
            }}
            onSuccess={handlePaymentSuccess}
            monto={preciosPorPlan[selectedLigaForPayment.plan as keyof typeof preciosPorPlan] || 0}
            concepto={`Suscripción Plan ${selectedLigaForPayment.plan} - ${selectedLigaForPayment.nombre_liga}`}
          />
        )}
      </div>
    </div>
  );
}
