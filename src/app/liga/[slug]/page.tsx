'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Calendar, Users, MapPin, Award, ChevronRight, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicLigaPage({ params }: { params: { slug: string } }) {
  const [liga, setLiga] = useState<any>(null);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [partidos, setPartidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    cargarDatosLiga();
  }, [params.slug]);

  const cargarDatosLiga = async () => {
    try {
      // 1. Obtener la liga
      const { data: ligaData, error: errLiga } = await supabase
        .from('ligas')
        .select('*')
        .eq('slug', params.slug)
        .single();

      if (errLiga || !ligaData) {
        setNotFound(true);
        return;
      }
      setLiga(ligaData);

      // 2. Obtener equipos (Tabla de Posiciones Básica)
      const { data: equiposData } = await supabase
        .from('equipos')
        .select('*')
        .eq('liga_id', ligaData.id);

      // 3. Obtener partidos finalizados y próximos
      const { data: partidosData } = await supabase
        .from('partidos')
        .select(`
          *,
          equipo_local:equipos!partidos_equipo_local_id_fkey(nombre),
          equipo_visitante:equipos!partidos_equipo_visitante_id_fkey(nombre),
          cancha:canchas(nombre)
        `)
        .eq('liga_id', ligaData.id)
        .order('fecha_jornada', { ascending: true });

      setPartidos(partidosData || []);

      // Calcular estadísticas de tabla (W/D/L/Points) a partir de los partidos
      const stats = (equiposData || []).map(equipo => {
        let pj = 0, pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;

        (partidosData || []).filter(p => p.estado === 'finalizado').forEach(partido => {
          if (partido.equipo_local_id === equipo.id) {
            pj++;
            gf += partido.marcador_local;
            gc += partido.marcador_visitante;
            if (partido.marcador_local > partido.marcador_visitante) pg++;
            else if (partido.marcador_local === partido.marcador_visitante) pe++;
            else pp++;
          } else if (partido.equipo_visitante_id === equipo.id) {
            pj++;
            gf += partido.marcador_visitante;
            gc += partido.marcador_local;
            if (partido.marcador_visitante > partido.marcador_local) pg++;
            else if (partido.marcador_visitante === partido.marcador_local) pe++;
            else pp++;
          }
        });

        const dif = gf - gc;
        const pts = (pg * 3) + (pe * 1); // 3 pts victoria, 1 pt empate

        return { ...equipo, pj, pg, pe, pp, gf, gc, dif, pts };
      });

      // Ordenar por Puntos, luego DIF, luego GF
      stats.sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
      setEquipos(stats);

    } catch (error) {
      console.error('Error cargando liga:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Liga no encontrada</h1>
          <p className="text-gray-600 mb-6">La liga que buscas no existe o ha sido eliminada.</p>
          <Link href="/ligas">
            <Button>Ver todas las ligas</Button>
          </Link>
        </div>
      </div>
    );
  }

  const proximosPartidos = partidos.filter(p => p.estado === 'programado').slice(0, 5);
  const ultimosResultados = partidos.filter(p => p.estado === 'finalizado').reverse().slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-300 via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Trophy className="w-12 h-12 text-yellow-400" />
          </div>
          <div className="text-center md:text-left flex-1">
            <Badge className="mb-3 bg-blue-500 hover:bg-blue-600">{liga.categoria || 'Categoría Libre'}</Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{liga.nombre_liga}</h1>
            <p className="text-blue-200 text-lg flex items-center justify-center md:justify-start gap-2">
              <MapPin className="w-5 h-5" />
              {liga.ciudad || 'Ubicación no especificada'}
            </p>
          </div>
          <div>
            {!liga.activa || !liga.estatus_pago ? (
              <Badge className="bg-red-500 text-white text-lg px-4 py-2">Torneo Pausado</Badge>
            ) : (
              <Link href="/unirse-liga">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg">
                  Inscribir mi Equipo
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <Tabs defaultValue="posiciones" className="w-full">
          <div className="bg-white rounded-t-xl shadow-sm border-b p-2">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-transparent gap-2 h-auto">
              <TabsTrigger value="posiciones" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3 rounded-lg">
                <Award className="w-4 h-4 mr-2" /> Posiciones
              </TabsTrigger>
              <TabsTrigger value="partidos" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3 rounded-lg">
                <Calendar className="w-4 h-4 mr-2" /> Calendario
              </TabsTrigger>
              <TabsTrigger value="equipos" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3 rounded-lg">
                <Users className="w-4 h-4 mr-2" /> Equipos
              </TabsTrigger>
              <TabsTrigger value="info" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3 rounded-lg">
                <Shield className="w-4 h-4 mr-2" /> Info
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TABLA DE POSICIONES */}
          <TabsContent value="posiciones" className="mt-6">
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="bg-white border-b">
                <CardTitle className="text-xl">Tabla General</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-lg">Pos</th>
                      <th className="px-6 py-4">Equipo</th>
                      <th className="px-4 py-4 text-center">PTS</th>
                      <th className="px-4 py-4 text-center">PJ</th>
                      <th className="px-4 py-4 text-center hidden sm:table-cell">G</th>
                      <th className="px-4 py-4 text-center hidden sm:table-cell">E</th>
                      <th className="px-4 py-4 text-center hidden sm:table-cell">P</th>
                      <th className="px-4 py-4 text-center hidden md:table-cell">GF</th>
                      <th className="px-4 py-4 text-center hidden md:table-cell">GC</th>
                      <th className="px-4 py-4 text-center">DIF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {equipos.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                          Aún no hay equipos inscritos en esta liga.
                        </td>
                      </tr>
                    ) : (
                      equipos.map((equipo, index) => (
                        <tr key={equipo.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-500">{index + 1}</td>
                          <td className="px-6 py-4 font-bold text-gray-900">{equipo.nombre}</td>
                          <td className="px-4 py-4 text-center font-bold text-blue-600 text-base">{equipo.pts}</td>
                          <td className="px-4 py-4 text-center text-gray-600">{equipo.pj}</td>
                          <td className="px-4 py-4 text-center text-gray-600 hidden sm:table-cell">{equipo.pg}</td>
                          <td className="px-4 py-4 text-center text-gray-600 hidden sm:table-cell">{equipo.pe}</td>
                          <td className="px-4 py-4 text-center text-gray-600 hidden sm:table-cell">{equipo.pp}</td>
                          <td className="px-4 py-4 text-center text-gray-600 hidden md:table-cell">{equipo.gf}</td>
                          <td className="px-4 py-4 text-center text-gray-600 hidden md:table-cell">{equipo.gc}</td>
                          <td className={`px-4 py-4 text-center font-semibold ${equipo.dif > 0 ? 'text-green-600' : equipo.dif < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {equipo.dif > 0 ? `+${equipo.dif}` : equipo.dif}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* CALENDARIO Y RESULTADOS */}
          <TabsContent value="partidos" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-white border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Próximos Partidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {proximosPartidos.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No hay partidos programados.</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {proximosPartidos.map(p => (
                        <div key={p.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-blue-600 font-semibold mb-1">
                              {new Date(p.fecha_jornada).toLocaleString('es-MX', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className="flex justify-between items-center pr-4">
                              <span className="font-medium text-gray-900">{p.equipo_local?.nombre}</span>
                              <span className="text-gray-400 text-sm mx-2">vs</span>
                              <span className="font-medium text-gray-900">{p.equipo_visitante?.nombre}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {p.cancha?.nombre || 'Por definir'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="bg-white border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-green-600" />
                    Últimos Resultados
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {ultimosResultados.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">Aún no hay resultados registrados.</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {ultimosResultados.map(p => (
                        <div key={p.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">
                              {new Date(p.fecha_jornada).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                            </p>
                            <div className="flex justify-between items-center pr-4">
                              <span className={`font-medium ${p.marcador_local > p.marcador_visitante ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>{p.equipo_local?.nombre}</span>
                              <div className="bg-gray-100 px-3 py-1 rounded font-bold text-gray-800 mx-2 tracking-widest">
                                {p.marcador_local} - {p.marcador_visitante}
                              </div>
                              <span className={`font-medium ${p.marcador_visitante > p.marcador_local ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>{p.equipo_visitante?.nombre}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* EQUIPOS */}
          <TabsContent value="equipos" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {equipos.map(equipo => (
                <Card key={equipo.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                      {equipo.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{equipo.nombre}</h3>
                      <p className="text-sm text-gray-500">Inscrito</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* INFO */}
          <TabsContent value="info" className="mt-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-8 prose max-w-none">
                <h3 className="text-2xl font-bold mb-4">Sobre la Liga</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {liga.descripcion || 'Esta liga no ha proporcionado una descripción detallada. Únete para participar en los próximos torneos.'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Deporte</p>
                    <p className="font-semibold text-gray-900 capitalize">{liga.deporte}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Categoría</p>
                    <p className="font-semibold text-gray-900">{liga.categoria || 'Libre'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Formato</p>
                    <p className="font-semibold text-gray-900 capitalize">{liga.tipo_torneo || 'Torneo Largo'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Sede</p>
                    <p className="font-semibold text-gray-900">{liga.ciudad || 'No especificada'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
