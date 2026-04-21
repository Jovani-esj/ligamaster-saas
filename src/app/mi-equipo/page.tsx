'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Crown, AlertCircle, Shield, CreditCard, DollarSign, CheckCircle2, Receipt } from 'lucide-react';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import JugadorManager from '@/components/admin/JugadorManager';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentModal } from '@/components/ui/PaymentModal';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getPartidosPorEquipo } from '@/lib/database';
import { Trophy, Calendar, MapPin, Award } from 'lucide-react';

// Tipo para simular los adeudos del equipo
interface AdeudoSimulado {
  id: string;
  concepto: string;
  monto: number;
  pagado: boolean;
  fecha: string;
}

export default function MiEquipoPage() {
  const { profile } = useSimpleAuth();
  const [equipo, setEquipo] = useState<{ id: string; nombre: string; liga_id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jugadores');
  const [partidos, setPartidos] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);

  // Estados para simulación de pagos
  const [adeudos, setAdeudos] = useState<AdeudoSimulado[]>([
    { id: '1', concepto: 'Inscripción Torneo Apertura', monto: 1500, pagado: false, fecha: new Date().toISOString() },
    { id: '2', concepto: 'Arbitraje Jornada 1', monto: 350, pagado: false, fecha: new Date().toISOString() },
    { id: '3', concepto: 'Credenciales Jugadores', monto: 500, pagado: true, fecha: new Date(Date.now() - 864000000).toISOString() }
  ]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAdeudo, setSelectedAdeudo] = useState<AdeudoSimulado | null>(null);

  // Check if user is capitan
  const isCapitan = profile?.rol === 'capitan_equipo' || profile?.es_capitan_equipo;

  const cargarEquipo = useCallback(async () => {
    if (!profile?.equipo_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('equipos')
        .select('id, nombre, liga_id')
        .eq('id', profile.equipo_id)
        .single();

      if (error) throw error;
      setEquipo(data);

      if (data) {
        const partidosEquipo = await getPartidosPorEquipo(data.id);
        setPartidos(partidosEquipo);

        // Calcular estadística rápida del equipo
        let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
        partidosEquipo.filter(p => p.estado === 'finalizado').forEach(p => {
          if (p.equipo_local_id === data.id) {
            gf += p.marcador_local;
            gc += p.marcador_visitante;
            if (p.marcador_local > p.marcador_visitante) pg++;
            else if (p.marcador_local === p.marcador_visitante) pe++;
            else pp++;
          } else if (p.equipo_visitante_id === data.id) {
            gf += p.marcador_visitante;
            gc += p.marcador_local;
            if (p.marcador_visitante > p.marcador_local) pg++;
            else if (p.marcador_visitante === p.marcador_local) pe++;
            else pp++;
          }
        });
        setEstadisticas({ 
          pj: pg + pe + pp, pg, pe, pp, gf, gc, dif: gf - gc, pts: (pg * 3) + (pe * 1) 
        });
      }
    } catch (error) {
      console.error('Error cargando equipo:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.equipo_id]);

  useEffect(() => {
    cargarEquipo();
  }, [cargarEquipo]);

  const handlePagarAdeudo = (adeudo: AdeudoSimulado) => {
    setSelectedAdeudo(adeudo);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    if (!selectedAdeudo) return;
    
    // Actualizar el estado local para simular el pago
    setAdeudos(prev => prev.map(a => 
      a.id === selectedAdeudo.id ? { ...a, pagado: true } : a
    ));
    
    setIsPaymentModalOpen(false);
    setSelectedAdeudo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isCapitan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600">
              Solo los capitanes de equipo pueden acceder a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!equipo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-12">
            <CardContent>
              <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Sin Equipo Asignado</h1>
              <p className="text-gray-600 mb-6">
                No tienes un equipo asignado. Como capitán, debes solicitar unirte a una liga primero.
              </p>
              <Link href="/unirse-liga">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Buscar Liga para Unirme
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const adeudosPendientes = adeudos.filter(a => !a.pagado);
  const adeudosPagados = adeudos.filter(a => a.pagado);
  const totalAdeudo = adeudosPendientes.reduce((acc, a) => acc + a.monto, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            Mi Equipo
          </h1>
          <p className="text-gray-600 mt-2">
            Equipo: <span className="font-semibold">{equipo.nombre}</span>
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px] mb-8">
            <TabsTrigger value="jugadores" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Jugadores
            </TabsTrigger>
            <TabsTrigger value="partidos" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Partidos
            </TabsTrigger>
            <TabsTrigger value="finanzas" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Finanzas
              {adeudosPendientes.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {adeudosPendientes.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jugadores">
            <JugadorManager equipoId={equipo.id} equipoNombre={equipo.nombre} />
          </TabsContent>

          <TabsContent value="partidos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Rendimiento Rápido */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Rendimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {estadisticas ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-xl text-center">
                        <span className="block text-4xl font-extrabold text-blue-700">{estadisticas.pts}</span>
                        <span className="text-sm font-semibold text-blue-900 uppercase">Puntos Totales</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm border-t pt-4">
                        <div><div className="font-bold text-green-600">{estadisticas.pg}</div>Victorias</div>
                        <div><div className="font-bold text-gray-600">{estadisticas.pe}</div>Empates</div>
                        <div><div className="font-bold text-red-600">{estadisticas.pp}</div>Derrotas</div>
                      </div>
                      <div className="flex justify-between border-t pt-4 text-sm">
                        <span className="text-gray-500">Goles a favor:</span>
                        <span className="font-medium">{estadisticas.gf}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Goles en contra:</span>
                        <span className="font-medium">{estadisticas.gc}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Diferencia:</span>
                        <span className={`font-bold ${estadisticas.dif > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {estadisticas.dif > 0 ? `+${estadisticas.dif}` : estadisticas.dif}
                        </span>
                      </div>
                      <Link href={`/liga/${equipo.liga_id || 'no-liga'}`} className="block mt-4">
                        <Button variant="outline" className="w-full">Ver Tabla Completa</Button>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center">Aún no hay estadísticas.</p>
                  )}
                </CardContent>
              </Card>

              {/* Calendario de Partidos */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    Calendario del Equipo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {partidos.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">El calendario aún no ha sido publicado por el administrador.</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {partidos.map(p => {
                        const isLocal = p.equipo_local_id === equipo.id;
                        const rival = isLocal ? p.equipo_visitante?.nombre : p.equipo_local?.nombre;
                        return (
                          <div key={p.id} className="py-4 hover:bg-gray-50 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-blue-600 mb-1">
                                {new Date(p.fecha_jornada).toLocaleString('es-MX', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <div className="font-bold text-gray-900 text-lg">
                                vs {rival || 'Por definir'}
                              </div>
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {p.cancha?.nombre || 'Cancha por definir'} • {isLocal ? 'Local' : 'Visitante'}
                              </p>
                            </div>
                            <div>
                              {p.estado === 'programado' ? (
                                <Badge variant="secondary">Por Jugar</Badge>
                              ) : (
                                <div className="text-center px-4 py-2 bg-gray-100 rounded-lg">
                                  <span className="font-bold text-xl">{p.marcador_local} - {p.marcador_visitante}</span>
                                  <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Final</div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          <TabsContent value="finanzas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Resumen de Deuda */}
              <Card className="md:col-span-1 bg-white border-2 border-red-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    Total a Pagar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${totalAdeudo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-sm text-gray-500">
                    Tienes {adeudosPendientes.length} adeudo(s) pendiente(s)
                  </p>
                </CardContent>
              </Card>

              {/* Lista de Adeudos Pendientes */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-gray-500" />
                    Adeudos Pendientes
                  </CardTitle>
                  <CardDescription>Paga tus inscripciones y arbitrajes en línea (Simulador)</CardDescription>
                </CardHeader>
                <CardContent>
                  {adeudosPendientes.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">¡Tu equipo está al día!</p>
                      <p className="text-sm text-gray-500">No tienes adeudos pendientes.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adeudosPendientes.map(adeudo => (
                        <div key={adeudo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                          <div>
                            <h4 className="font-semibold text-gray-900">{adeudo.concepto}</h4>
                            <p className="text-sm text-gray-500">
                              Generado el {new Date(adeudo.fecha).toLocaleDateString('es-MX')}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-900 text-lg">
                              ${adeudo.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                            <Button onClick={() => handlePagarAdeudo(adeudo)} className="bg-blue-600 hover:bg-blue-700">
                              <CreditCard className="w-4 h-4 mr-2" />
                              Pagar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Historial de Pagos */}
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Historial de Pagos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {adeudosPagados.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay pagos registrados aún.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th className="px-4 py-3">Concepto</th>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Monto</th>
                            <th className="px-4 py-3">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adeudosPagados.map(pago => (
                            <tr key={pago.id} className="border-b">
                              <td className="px-4 py-3 font-medium text-gray-900">{pago.concepto}</td>
                              <td className="px-4 py-3">{new Date(pago.fecha).toLocaleDateString('es-MX')}</td>
                              <td className="px-4 py-3 font-medium">${pago.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Pagado
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {selectedAdeudo && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedAdeudo(null);
            }}
            onSuccess={handlePaymentSuccess}
            monto={selectedAdeudo.monto}
            concepto={selectedAdeudo.concepto}
          />
        )}
      </div>
    </div>
  );
}
