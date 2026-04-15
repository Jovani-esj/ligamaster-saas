// Algoritmo de programación de partidos Round Robin
export interface Equipo {
  id: string;
  nombre: string;
}

export interface PartidoProgramado {
  equipo_local_id: string;
  equipo_visitante_id: string;
  jornada: number;
  fecha_hora: Date;
}

export interface ConfiguracionProgramacion {
  equipos: Equipo[];
  fecha_inicio: Date;
  dias_juego: string[]; // ['lunes', 'miercoles', 'viernes']
  hora_inicio: string; // '19:00'
  hora_fin: string; // '23:00'
  intervalo_minutos: number;
  vueltas: number; // 1 = ida, 2 = ida y vuelta
  cancha_id: string;
}

export class RoundRobinScheduler {
  private configuracion: ConfiguracionProgramacion;

  constructor(configuracion: ConfiguracionProgramacion) {
    this.configuracion = configuracion;
  }

  /**
   * Genera programación completa usando algoritmo Round Robin
   */
  public generarProgramacion(): PartidoProgramado[] {
    const equipos = this.configuracion.equipos;
    const n = equipos.length;

    // Validar que haya al menos 2 equipos
    if (n < 2) {
      throw new Error('Se necesitan al menos 2 equipos para generar la programación');
    }

    // Si es impar, agregar un equipo "fantasma" para simular bye
    const esImpar = n % 2 !== 0;
    const equiposConFantasma = esImpar 
      ? [...equipos, { id: 'BYE', nombre: 'DESCANSO' }] 
      : equipos;

    const totalEquipos = equiposConFantasma.length;
    const jornadasPorVuelta = totalEquipos - 1;
    const totalJornadas = jornadasPorVuelta * this.configuracion.vueltas;

    const partidos: PartidoProgramado[] = [];

    // Generar cada vuelta
    for (let vuelta = 0; vuelta < this.configuracion.vueltas; vuelta++) {
      const partidosVuelta = this.generarVuelta(
        equiposConFantasma, 
        vuelta, 
        vuelta * jornadasPorVuelta
      );
      partidos.push(...partidosVuelta);
    }

    // Asignar fechas y horas a los partidos
    return this.asignarFechasHoras(partidos);
  }

  /**
   * Genera los partidos de una sola vuelta usando el algoritmo Round Robin
   */
  private generarVuelta(
    equipos: Equipo[], 
    numeroVuelta: number, 
    jornadaInicial: number
  ): PartidoProgramado[] {
    const n = equipos.length;
    const partidos: PartidoProgramado[] = [];

    // Crear matriz de posiciones
    const posiciones = [...equipos];

    // Para cada jornada
    for (let jornada = 0; jornada < n - 1; jornada++) {
      const partidosJornada: PartidoProgramado[] = [];

      // Generar partidos de esta jornada
      for (let i = 0; i < n / 2; i++) {
        const equipo1 = posiciones[i];
        const equipo2 = posiciones[n - 1 - i];

        // Si uno de los equipos es el fantasma (BYE), no hay partido
        if (equipo1.id !== 'BYE' && equipo2.id !== 'BYE') {
          // Determinar local/visitante alternando en cada vuelta
          const esLocalPar = (numeroVuelta + jornada) % 2 === 0;
          
          const partido: PartidoProgramado = {
            equipo_local_id: esLocalPar ? equipo1.id : equipo2.id,
            equipo_visitante_id: esLocalPar ? equipo2.id : equipo1.id,
            jornada: jornadaInicial + jornada + 1,
            fecha_hora: new Date() // Se asignará después
          };

          partidosJornada.push(partido);
        }
      }

      partidos.push(...partidosJornada);

      // Rotar equipos para la siguiente jornada
      // Mantener el primer equipo fijo y rotar los demás
      const primerEquipo = posiciones[0];
      const equiposRotar = posiciones.slice(1);
      equiposRotar.unshift(equiposRotar.pop()!);
      posiciones[0] = primerEquipo;
      for (let i = 0; i < equiposRotar.length; i++) {
        posiciones[i + 1] = equiposRotar[i];
      }
    }

    return partidos;
  }

  /**
   * Asigna fechas y horas a los partidos según la configuración
   */
  private asignarFechasHoras(partidos: PartidoProgramado[]): PartidoProgramado[] {
    const partidosConFechas: PartidoProgramado[] = [];
    let fechaActual = new Date(this.configuracion.fecha_inicio);

    // Agrupar partidos por jornada
    const partidosPorJornada = this.agruparPorJornada(partidos);

    // Para cada jornada
    for (const [jornada, partidosJornada] of Object.entries(partidosPorJornada)) {
      const fechaJornada = this.encontrarSiguienteFechaDisponible(fechaActual);
      
      // Asignar horas a los partidos de la jornada
      const horaInicio = this.parseHora(this.configuracion.hora_inicio);
      const horaFin = this.parseHora(this.configuracion.hora_fin);
      
      let horaActual = new Date(fechaJornada);
      horaActual.setHours(horaInicio.hours, horaInicio.minutes, 0, 0);

      for (const partido of partidosJornada) {
        // Verificar que aún hay tiempo disponible
        if (this.compararHoras(horaActual, horaFin) <= 0) {
          partido.fecha_hora = new Date(horaActual.getTime());
          partidosConFechas.push(partido);

          // Siguiente hora
          horaActual = new Date(horaActual.getTime() + this.configuracion.intervalo_minutos * 60000);
        } else {
          // Si no hay más tiempo en el día, pasar al siguiente día disponible
          fechaActual = new Date(fechaJornada);
          fechaActual.setDate(fechaActual.getDate() + 1);
          const siguienteFecha = this.encontrarSiguienteFechaDisponible(fechaActual);
          
          horaActual = new Date(siguienteFecha);
          horaActual.setHours(horaInicio.hours, horaInicio.minutes, 0, 0);
          
          partido.fecha_hora = new Date(horaActual);
          partidosConFechas.push(partido);
          
          horaActual = new Date(horaActual.getTime() + this.configuracion.intervalo_minutos * 60000);
        }
      }

      fechaActual = new Date(fechaJornada);
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return partidosConFechas;
  }

  /**
   * Agrupa partidos por jornada
   */
  private agruparPorJornada(partidos: PartidoProgramado[]): Record<number, PartidoProgramado[]> {
    const agrupados: Record<number, PartidoProgramado[]> = {};
    
    for (const partido of partidos) {
      if (!agrupados[partido.jornada]) {
        agrupados[partido.jornada] = [];
      }
      agrupados[partido.jornada].push(partido);
    }
    
    return agrupados;
  }

  /**
   * Encuentra la siguiente fecha disponible según los días de juego configurados
   */
  private encontrarSiguienteFechaDisponible(fecha: Date): Date {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    let fechaActual = new Date(fecha);

    while (!this.configuracion.dias_juego.includes(diasSemana[fechaActual.getDay()])) {
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return fechaActual;
  }

  /**
   * Convierte string de hora a objeto {hours, minutes}
   */
  private parseHora(hora: string): { hours: number; minutes: number } {
    const [hours, minutes] = hora.split(':').map(Number);
    return { hours, minutes };
  }

  /**
   * Compara dos horas (ignorando fecha)
   */
  private compararHoras(hora1: Date, hora2: Date): number {
    const h1 = hora1.getHours() * 60 + hora1.getMinutes();
    const h2 = hora2.getHours() * 60 + hora2.getMinutes();
    return h1 - h2;
  }

  /**
   * Genera resumen de la programación
   */
  public generarResumen(): {
    totalJornadas: number;
    totalPartidos: number;
    fechaInicio: Date;
    fechaFinEstimada: Date;
    partidosPorJornada: Record<number, number>;
  } {
    const equipos = this.configuracion.equipos;
    const n = equipos.length;
    
    const jornadasPorVuelta = n % 2 === 0 ? n - 1 : n;
    const totalJornadas = jornadasPorVuelta * this.configuracion.vueltas;
    const totalPartidos = this.configuracion.vueltas * (n * (n - 1)) / 2;

    // Estimar fecha de fin
    const partidosPorSemana = this.configuracion.dias_juego.length;
    const semanasNecesarias = Math.ceil(totalJornadas / partidosPorSemana);
    const fechaFinEstimada = new Date(this.configuracion.fecha_inicio);
    fechaFinEstimada.setDate(fechaFinEstimada.getDate() + (semanasNecesarias * 7));

    const partidosPorJornada: Record<number, number> = {};
    const partidosPorJornadaCount = Math.floor(n / 2);
    
    for (let i = 1; i <= totalJornadas; i++) {
      partidosPorJornada[i] = partidosPorJornadaCount;
    }

    return {
      totalJornadas,
      totalPartidos,
      fechaInicio: this.configuracion.fecha_inicio,
      fechaFinEstimada,
      partidosPorJornada
    };
  }
}

/**
 * Función de utilidad para crear una configuración de programación
 */
export function crearConfiguracionProgramacion(
  equipos: Equipo[],
  fechaInicio: Date,
  diasJuego: string[],
  horaInicio: string,
  horaFin: string,
  intervaloMinutos: number = 90,
  vueltas: number = 1,
  canchaId: string
): ConfiguracionProgramacion {
  return {
    equipos,
    fecha_inicio: fechaInicio,
    dias_juego: diasJuego,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    intervalo_minutos: intervaloMinutos,
    vueltas,
    cancha_id: canchaId
  };
}
