-- ========================================
-- SCRIPT DE MIGRACIÓN PARA BASE DE DATOS
-- LigaMaster SaaS - Actualización de estructura existente
-- ========================================

-- NOTA: Ejecutar en orden en el editor SQL de Supabase

-- ========================================
-- 1. MODIFICAR TABLA user_profiles
-- ========================================

-- Agregar nuevas columnas si no existen
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS equipo_id UUID REFERENCES equipos(id);

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS es_capitan_equipo BOOLEAN DEFAULT false;

-- Actualizar el CHECK constraint para incluir nuevos roles
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_rol_check;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_rol_check 
CHECK (rol::text = ANY (ARRAY['superadmin'::text, 'adminadmin'::text, 'admin_liga'::text, 'capitan_equipo'::text, 'usuario'::text]));

-- ========================================
-- 2. CREAR NUEVAS TABLAS
-- ========================================

-- Tabla de Equipos
-- Primero eliminar si existe para evitar conflictos de estructura
DROP TABLE IF EXISTS equipos CASCADE;

CREATE TABLE equipos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    color_primario VARCHAR(7) DEFAULT '#000000',
    color_secundario VARCHAR(7) DEFAULT '#FFFFFF',
    capitan_id UUID,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(liga_id, nombre)
);

-- Tabla de Jugadores
DROP TABLE IF EXISTS jugadores CASCADE;

CREATE TABLE jugadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
    user_profile_id UUID REFERENCES user_profiles(id),
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255),
    email VARCHAR(255),
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    numero_camiseta INTEGER,
    posicion VARCHAR(50),
    foto_url VARCHAR(500),
    activo BOOLEAN DEFAULT true,
    es_capitan BOOLEAN DEFAULT false,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_jugador_equipo UNIQUE(equipo_id, email),
    CONSTRAINT unique_jugador_perfil UNIQUE(user_profile_id)
);

-- Tabla de Canchas
DROP TABLE IF EXISTS canchas CASCADE;

CREATE TABLE canchas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    tipo VARCHAR(50) DEFAULT 'futbol',
    superficie VARCHAR(50) DEFAULT 'natural',
    capacidad_espectadores INTEGER DEFAULT 0,
    tiene_iluminacion BOOLEAN DEFAULT false,
    tiene_vestuarios BOOLEAN DEFAULT false,
    precio_hora DECIMAL(10,2) DEFAULT 0,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(liga_id, nombre)
);

-- Tabla de Configuración de Temporada
DROP TABLE IF EXISTS configuraciones_temporada CASCADE;

CREATE TABLE configuraciones_temporada (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
    nombre_temporada VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_juego TEXT[],
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    intervalo_minutos INTEGER DEFAULT 90,
    formato VARCHAR(20) DEFAULT 'todos_contra_todos',
    vueltas INTEGER DEFAULT 1,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Eventos de Partido
DROP TABLE IF EXISTS eventos_partido CASCADE;

CREATE TABLE eventos_partido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partido_id UUID NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
    jugador_id UUID REFERENCES jugadores(id),
    equipo_id UUID REFERENCES equipos(id),
    tipo_evento VARCHAR(20) NOT NULL,
    minuto INTEGER,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. ACTUALIZAR TABLA partidos (si existe)
-- ========================================

-- Verificar si la tabla partidos existe y agregar columnas faltantes
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'partidos') THEN
        -- Agregar columnas faltantes si no existen
        ALTER TABLE partidos 
        ADD COLUMN IF NOT EXISTS cancha_id UUID REFERENCES canchas(id);
        
        ALTER TABLE partidos 
        ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER DEFAULT 90;
        
        ALTER TABLE partidos 
        ADD COLUMN IF NOT EXISTS jornada INTEGER;
        
        ALTER TABLE partidos 
        ADD COLUMN IF NOT EXISTS observaciones TEXT;
        
        ALTER TABLE partidos 
        ADD COLUMN IF NOT EXISTS creado_por UUID;
        
        ALTER TABLE partidos 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Renombrar marcador_local a goles_local y marcador_visitante a goles_visitante
        ALTER TABLE partidos RENAME COLUMN marcador_local TO goles_local;
        ALTER TABLE partidos RENAME COLUMN marcador_visitante TO goles_visitante;
    END IF;
END $$;

-- ========================================
-- 4. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================

CREATE INDEX IF NOT EXISTS idx_equipos_liga ON equipos(liga_id);
CREATE INDEX IF NOT EXISTS idx_equipos_capitan ON equipos(capitan_id);
CREATE INDEX IF NOT EXISTS idx_jugadores_equipo ON jugadores(equipo_id);
CREATE INDEX IF NOT EXISTS idx_jugadores_perfil ON jugadores(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_jugadores_email ON jugadores(email);
CREATE INDEX IF NOT EXISTS idx_canchas_liga ON canchas(liga_id);
CREATE INDEX IF NOT EXISTS idx_partidos_liga ON partidos(liga_id);
CREATE INDEX IF NOT EXISTS idx_partidos_equipos ON partidos(equipo_local_id, equipo_visitante_id);
CREATE INDEX IF NOT EXISTS idx_partidos_fecha ON partidos(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_partidos_estado ON partidos(estado);
CREATE INDEX IF NOT EXISTS idx_configuraciones_liga ON configuraciones_temporada(liga_id);

-- ========================================
-- 5. HABILITAR RLS EN TABLAS NUEVAS
-- ========================================

ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE canchas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_partido ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones_temporada ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 6. CREAR VISTAS ÚTILES
-- ========================================

-- Vista para estadísticas de liga
CREATE OR REPLACE VIEW vista_estadisticas_liga AS
SELECT 
    l.id as liga_id,
    l.nombre_liga,
    COUNT(DISTINCT e.id) as total_equipos,
    COUNT(DISTINCT j.id) as total_jugadores,
    COUNT(DISTINCT c.id) as total_canchas,
    COUNT(DISTINCT p.id) as total_partidos,
    COUNT(DISTINCT CASE WHEN p.estado = 'finalizado' THEN p.id END) as partidos_jugados
FROM ligas l
LEFT JOIN equipos e ON l.id = e.liga_id AND e.activo = true
LEFT JOIN jugadores j ON e.id = j.equipo_id AND j.activo = true
LEFT JOIN canchas c ON l.id = c.liga_id AND c.activa = true
LEFT JOIN partidos p ON l.id = p.liga_id
WHERE l.acta = true
GROUP BY l.id, l.nombre_liga;

-- Vista para tabla de posiciones
CREATE OR REPLACE VIEW vista_tabla_posiciones AS
SELECT 
    p.liga_id,
    e.id as equipo_id,
    e.nombre as equipo_nombre,
    COUNT(p.id) as partidos_jugados,
    COUNT(CASE WHEN p.goles_local > p.goles_visitante AND p.equipo_local_id = e.id THEN 1 END) +
    COUNT(CASE WHEN p.goles_visitante > p.goles_local AND p.equipo_visitante_id = e.id THEN 1 END) as partidos_ganados,
    COUNT(CASE WHEN p.goles_local = p.goles_visitante THEN 1 END) as partidos_empatados,
    COUNT(CASE WHEN p.goles_local < p.goles_visitante AND p.equipo_local_id = e.id THEN 1 END) +
    COUNT(CASE WHEN p.goles_visitante < p.goles_local AND p.equipo_visitante_id = e.id THEN 1 END) as partidos_perdidos,
    SUM(CASE WHEN p.equipo_local_id = e.id THEN p.goles_local ELSE p.goles_visitante END) as goles_favor,
    SUM(CASE WHEN p.equipo_local_id = e.id THEN p.goles_visitante ELSE p.goles_local END) as goles_contra,
    (SUM(CASE WHEN p.equipo_local_id = e.id THEN p.goles_local ELSE p.goles_visitante END) -
     SUM(CASE WHEN p.equipo_local_id = e.id THEN p.goles_visitante ELSE p.goles_local END)) as diferencia_goles,
    (COUNT(CASE WHEN p.goles_local > p.goles_visitante AND p.equipo_local_id = e.id THEN 1 END) +
     COUNT(CASE WHEN p.goles_visitante > p.goles_local AND p.equipo_visitante_id = e.id THEN 1 END)) * 3 +
    COUNT(CASE WHEN p.goles_local = p.goles_visitante THEN 1 END) as puntos
FROM partidos p
JOIN equipos e ON (e.id = p.equipo_local_id OR e.id = p.equipo_visitante_id)
WHERE p.estado = 'finalizado'
GROUP BY p.liga_id, e.id, e.nombre
ORDER BY puntos DESC, diferencia_goles DESC, goles_favor DESC;

-- ========================================
-- 7. FUNCIÓN PARA UPDATED_AT
-- ========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabla nueva
DROP TRIGGER IF EXISTS update_equipos_updated_at ON equipos;
CREATE TRIGGER update_equipos_updated_at BEFORE UPDATE ON equipos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jugadores_updated_at ON jugadores;
CREATE TRIGGER update_jugadores_updated_at BEFORE UPDATE ON jugadores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_canchas_updated_at ON canchas;
CREATE TRIGGER update_canchas_updated_at BEFORE UPDATE ON canchas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_configuraciones_temporada_updated_at ON configuraciones_temporada;
CREATE TRIGGER update_configuraciones_temporada_updated_at BEFORE UPDATE ON configuraciones_temporada
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 8. VERIFICACIÓN FINAL
-- ========================================

-- Mostrar todas las tablas creadas/modificadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ligas', 'equipos', 'jugadores', 'canchas', 'partidos', 'eventos_partido', 'configuraciones_temporada', 'user_profiles')
ORDER BY table_name;

-- Verificar nuevas columnas en user_profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('equipo_id', 'es_capitan_equipo')
ORDER BY column_name;
