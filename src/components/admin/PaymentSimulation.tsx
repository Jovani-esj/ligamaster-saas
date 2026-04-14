'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CreditCard, DollarSign, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface Liga {
  id: string;
  nombre_liga: string;
  slug: string;
  plan: 'Bronce' | 'Plata' | 'Oro';
  estatus_pago: boolean;
  contacto_email?: string;
  fecha_vencimiento?: string;
}

interface PaymentRecord {
  id: string;
  liga_id: string;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  estatus: string;
  referencia: string;
  meses_contratados: number;
  ligas: {
    nombre_liga: string;
    slug: string;
  };
}

export default function PaymentSimulation() {
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [selectedLiga, setSelectedLiga] = useState('');
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const precios = { Bronce: 100, Plata: 200, Oro: 500 };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ligasResponse, paymentsResponse] = await Promise.all([
        supabase.from('ligas').select('*').order('nombre_liga'),
        supabase
          .from('pagos')
          .select(`
            *,
            ligas (nombre_liga, slug)
          `)
          .order('fecha_pago', { ascending: false })
          .limit(20)
      ]);

      if (ligasResponse.error) throw ligasResponse.error;
      if (paymentsResponse.error) throw paymentsResponse.error;

      setLigas(ligasResponse.data || []);
      setPaymentHistory(paymentsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulatePayment = async () => {
    if (!selectedLiga) {
      alert('Por favor selecciona una liga');
      return;
    }

    const liga = ligas.find(l => l.id === selectedLiga);
    if (!liga) return;

    setProcessing(true);
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      const monto = precios[liga.plan] * months;
      const fechaVencimiento = new Date();
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + months);

      // Crear registro de pago
      const { error: paymentError } = await supabase
        .from('pagos')
        .insert([{
          liga_id: selectedLiga,
          monto,
          metodo_pago: 'simulado',
          estatus: 'completado',
          referencia: `SIM-${Date.now()}`,
          meses_contratados: months
        }]);

      if (paymentError) throw paymentError;

      // Actualizar estatus de la liga
      const { error: ligaError } = await supabase
        .from('ligas')
        .update({
          estatus_pago: true,
          fecha_vencimiento: fechaVencimiento.toISOString()
        })
        .eq('id', selectedLiga);

      if (ligaError) throw ligaError;

      // Enviar recordatorio simulado
      await sendPaymentReminder(liga);

      await fetchData();
      setSelectedLiga('');
      setMonths(1);
      
      alert('¡Pago procesado con éxito!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  const sendPaymentReminder = async (liga: Liga) => {
    // Simular envío de email de recordatorio
    console.log(`Enviando recordatorio de pago a ${liga.contacto_email} para la liga ${liga.nombre_liga}`);
    
    // Aquí podrías integrar un servicio real como SendGrid, Resend, etc.
    // Por ahora solo lo simulamos
  };

  const suspendLiga = async (ligaId: string) => {
    if (!confirm('¿Estás seguro de suspender esta liga?')) return;

    try {
      const { error } = await supabase
        .from('ligas')
        .update({ estatus_pago: false })
        .eq('id', ligaId);

      if (error) throw error;
      await fetchData();
      alert('Liga suspendida correctamente');
    } catch (error) {
      console.error('Error suspending liga:', error);
      alert('Error al suspender la liga');
    }
  };

  const selectedLigaData = ligas.find(l => l.id === selectedLiga);
  const totalAmount = selectedLigaData ? precios[selectedLigaData.plan] * months : 0;

  if (loading) {
    return <div className="p-8">Cargando datos de pagos...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulación de Pagos</h1>
        <p className="text-gray-600">Gestiona los pagos y suscripciones de las ligas</p>
      </div>

      {/* Formulario de simulación de pago */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Procesar Pago Simulado
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Liga
            </label>
            <select
              value={selectedLiga}
              onChange={(e) => setSelectedLiga(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una liga...</option>
              {ligas.map((liga) => (
                <option key={liga.id} value={liga.id}>
                  {liga.nombre_liga} ({liga.plan} - ${precios[liga.plan]}/mes)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meses a Contratar
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total a Pagar
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-lg font-semibold text-lg">
              ${totalAmount}
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={simulatePayment}
              disabled={!selectedLiga || processing}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4" />
                  Procesar Pago
                </>
              )}
            </button>
          </div>
        </div>

        {selectedLigaData && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Detalles del pago:</span>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Liga: <strong>{selectedLigaData.nombre_liga}</strong></p>
              <p>Plan: <strong>{selectedLigaData.plan}</strong></p>
              <p>Precio por mes: <strong>${precios[selectedLigaData.plan]}</strong></p>
              <p>Meses: <strong>{months}</strong></p>
              <p>Total: <strong>${totalAmount}</strong></p>
              <p>Fecha de vencimiento: <strong>
                {new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </strong></p>
            </div>
          </div>
        )}
      </div>

      {/* Lista de ligas y su estatus */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Estatus de Ligas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estatus Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ligas.map((liga) => (
                <tr key={liga.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{liga.nombre_liga}</div>
                    <div className="text-sm text-gray-500">/{liga.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      liga.plan === 'Oro' ? 'bg-yellow-100 text-yellow-800' :
                      liga.plan === 'Plata' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {liga.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {liga.estatus_pago ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-800 text-sm">Pagado</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-800 text-sm">Pendiente</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {liga.fecha_vencimiento 
                      ? new Date(liga.fecha_vencimiento).toLocaleDateString()
                      : 'No definida'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {liga.contacto_email || 'No registrado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!liga.estatus_pago && (
                      <button
                        onClick={() => setSelectedLiga(liga.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <DollarSign className="h-4 w-4" />
                      </button>
                    )}
                    {liga.estatus_pago && (
                      <button
                        onClick={() => suspendLiga(liga.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial de pagos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Historial de Pagos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estatus
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.fecha_pago).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.ligas.nombre_liga}</div>
                    <div className="text-sm text-gray-500">/{payment.ligas.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${payment.monto}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.meses_contratados}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.referencia}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.estatus === 'completado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.estatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
