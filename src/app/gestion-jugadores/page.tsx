'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Crown, AlertCircle } from 'lucide-react';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';
import JugadorManager from '@/components/admin/JugadorManager';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function GestionJugadoresPage() {
  const { profile } = useSimpleAuth();
  const [equipo, setEquipo] = useState<{ id: string; nombre: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarEquipo = useCallback(async () => {
    if (!profile?.equipo_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('equipos')
        .select('id, nombre')
        .eq('id', profile.equipo_id)
        .single();

      if (error) throw error;
      setEquipo(data);
    } catch (error) {
      console.error('Error cargando equipo:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.equipo_id]);

  useEffect(() => {
    cargarEquipo();
  }, [cargarEquipo]);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            Gestión de Jugadores
          </h1>
          <p className="text-gray-600 mt-2">
            Equipo: <span className="font-semibold">{equipo.nombre}</span>
          </p>
        </div>

        <JugadorManager equipoId={equipo.id} equipoNombre={equipo.nombre} />
      </div>
    </div>
  );
}
