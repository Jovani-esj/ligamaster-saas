-- ========================================
-- SCRIPT COMPLETO PARA RECREAR TODAS LAS TABLAS
-- LigaMaster SaaS - Estructura completa desde cero
-- ========================================

-- NOTA: Ejecutar en el editor SQL de Supabase
-- Este script respeta tu estructura existente y agrega las nuevas funcionalidades

-- ========================================
-- 1. TABLAS EXISTENTES (CON MEJORAS)
-- ========================================

-- Tabla de Ligas (manteniendo tu estructura exacta)
CREATE TABLE ligas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    descripcion text NOT NULL,
    nombre_liga text NOT NULL,
    slug text NOT NULL UNIQUE,
    owner_id uuid,
    estatus_pago boolean DEFAULT false,
    plan text DEFAULT 'Bronce'::text CHECK (plan = ANY (ARRAY['Bronce'::text, 'Plata'::text, 'Oro'::text])),
    fecha_registro timestamp with time zone DEFAULT now(),
    fecha_vencimiento timestamp with time zone,
    activa boolean DEFAULT true,
    CONSTRAINT ligas_pkey PRIMARY KEY (id)
);

-- Tabla de Equipos (manteniendo tu estructura + mejoras)
CREATE TABLE equipos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    liga_id uuid NOT NULL,
    nombre text NOT NULL,
    logo_url text,
    color_primario VARCHAR(7) DEFAULT '#000000',
    color_secundario VARCHAR(7) DEFAULT '#FFFFFF',
    capitan_id uuid,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT equipos_pkey PRIMARY KEY (id),
    CONSTRAINT equipos_liga_id_fkey FOREIGN KEY (liga_id) REFERENCES ligas(id) ON DELETE CASCADE,
    UNIQUE(liga_id, nombre)
);

-- Tabla de Torneos (manteniendo tu estructura)
CREATE TABLE torneos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    liga_id uuid NOT NULL,
    nombre text NOT NULL,
    activo boolean DEFAULT true,
    CONSTRAINT torneos_pkey PRIMARY KEY (id),
    CONSTRAINT torneos_liga_id_fkey FOREIGN KEY (liga_id) REFERENCES ligas(id) ON DELETE CASCADE
);

-- Tabla de Partidos (manteniendo tu estructura + mejoras)
CREATE TABLE partidos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    liga_id uuid NOT NULL,
    torneo_id uuid NOT NULL,
    equipo_local_id uuid,
    equipo_visitante_id uuid,
    marcador_local integer DEFAULT 0,
    marcador_visitante integer DEFAULT 0,
    fecha_jornada timestamp with time zone,
    estado text DEFAULT 'programado'::text CHECK (estado = ANY (ARRAY['programado'::text, 'jugado'::text, 'cancelado'::text])),
    cancha_id uuid,
    duracion_minutos integer DEFAULT 90,
    jornada integer,
    observaciones text,
    creado_por uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT partidos_pkey PRIMARY KEY (id),
    CONSTRAINT partidos_torneo_id_fkey FOREIGN KEY (torneo_id) REFERENCES torneos(id),
    CONSTRAINT partidos_equipo_local_id_fkey FOREIGN KEY (equipo_local_id) REFERENCES equipos(id),
    CONSTRAINT partidos_equipo_visitante_id_fkey FOREIGN KEY (equipo_visitante_id) REFERENCES equipos(id),
    CONSTRAINT partidos_equipo_diferente CHECK (equipo_local_id IS DISTINCT FROM equipo_visitante_id)
);

-- Tabla de User Profiles (actualizando tu estructura)
CREATE TABLE user_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    nombre character varying,
    apellido character varying,
    telefono character varying,
    fecha_nacimiento date,
    rol character varying DEFAULT 'usuario'::character varying CHECK (rol::text = ANY (ARRAY['superadmin'::character varying, 'adminadmin'::character varying, 'admin_liga'::character varying, 'capitan_equipo'::character varying, 'usuario'::character varying]::text[])),
    liga_id uuid,
    equipo_id uuid,
    es_capitan_equipo boolean DEFAULT false,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT user_profiles_liga_id_fkey FOREIGN KEY (liga_id) REFERENCES ligas(id),
    CONSTRAINT user_profiles_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

-- ========================================
-- 2. NUEVAS TABLAS PARA FUNCIONALIDADES COMPLETAS
-- ========================================

-- Tabla de Jugadores
CREATE TABLE jugadores (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    equipo_id uuid NOT NULL,
    user_profile_id uuid,
    nombre text NOT NULL,
    apellido text,
    email text,
    telefono text,
    fecha_nacimiento date,
    numero_camiseta integer,
    posicion text,
    foto_url text,
    activo boolean DEFAULT true,
    es_capitan boolean DEFAULT false,
    fecha_registro timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT jugadores_pkey PRIMARY KEY (id),
    CONSTRAINT jugadores_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    CONSTRAINT jugadores_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id),
    CONSTRAINT unique_jugador_equipo UNIQUE(equipo_id, email),
    CONSTRAINT unique_jugador_perfil UNIQUE(user_profile_id)
);

-- Tabla de Canchas
CREATE TABLE canchas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    liga_id uuid NOT NULL,
    nombre text NOT NULL,
    direccion text,
    tipo text DEFAULT 'futbol',
    superficie text DEFAULT 'natural',
    capacidad_espectadores integer DEFAULT 0,
    tiene_iluminacion boolean DEFAULT false,
    tiene_vestuarios boolean DEFAULT false,
    precio_hora decimal(10,2) DEFAULT 0,
    activa boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT canchas_pkey PRIMARY KEY (id),
    CONSTRAINT canchas_liga_id_fkey FOREIGN KEY (liga_id) REFERENCES ligas(id) ON DELETE CASCADE,
    UNIQUE(liga_id, nombre)
);

-- Tabla de Configuración de Temporada
CREATE TABLE configuraciones_temporada (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    liga_id uuid NOT NULL,
    nombre_temporada text NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    dias_juego text[],
    hora_inicio time NOT NULL,
    hora_fin time NOT NULL,
    intervalo_minutos integer DEFAULT 90,
    formato text DEFAULT 'todos_contra_todos',
    vueltas integer DEFAULT 1,
    activa boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT configuraciones_temporada_pkey PRIMARY KEY (id),
    CONSTRAINT configuraciones_temporada_liga_id_fkey FOREIGN KEY (liga_id) REFERENCES ligas(id) ON DELETE CASCADE
);

-- Tabla de Eventos de Partido
CREATE TABLE eventos_partido (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    partido_id uuid NOT NULL,
    jugador_id uuid,
    equipo_id uuid,
    tipo_evento text NOT NULL,
    minuto integer,
    descripcion text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT eventos_partido_pkey PRIMARY KEY (id),
    CONSTRAINT eventos_partido_partido_id_fkey FOREIGN KEY (partido_id) REFERENCES partidos(id) ON DELETE CASCADE,
    CONSTRAINT eventos_partido_jugador_id_fkey FOREIGN KEY (jugador_id) REFERENCES jugadores(id),
    CONSTRAINT eventos_partido_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

-- ========================================
-- 3. ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================

CREATE INDEX idx_equipos_liga ON equipos(liga_id);
CREATE INDEX idx_equipos_capitan ON equipos(capitan_id);
CREATE INDEX idx_jugadores_equipo ON jugadores(equipo_id);
CREATE INDEX idx_jugadores_perfil ON jugadores(user_profile_id);
CREATE INDEX idx_jugadores_email ON jugadores(email);
CREATE INDEX idx_canchas_liga ON canchas(liga_id);
CREATE INDEX idx_partidos_liga ON partidos(liga_id);
CREATE INDEX idx_partidos_equipos ON partidos(equipo_local_id, equipo_visitante_id);
CREATE INDEX idx_partidos_fecha ON partidos(fecha_jornada);
CREATE INDEX idx_partidos_estado ON partidos(estado);
CREATE INDEX idx_configuraciones_liga ON configuraciones_temporada(liga_id);

-- ========================================
-- 4. VISTAS ÚTILES
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
    COUNT(DISTINCT CASE WHEN p.estado = 'jugado' THEN p.id END) as partidos_jugados
FROM ligas l
LEFT JOIN equipos e ON l.id = e.liga_id AND e.activo = true
LEFT JOIN jugadores j ON e.id = j.equipo_id AND j.activo = true
LEFT JOIN canchas c ON l.id = c.liga_id AND c.activa = true
LEFT JOIN partidos p ON l.id = p.liga_id
WHERE l.activa = true
GROUP BY l.id, l.nombre_liga;

-- Vista para tabla de posiciones
CREATE OR REPLACE VIEW vista_tabla_posiciones AS
SELECT 
    p.liga_id,
    e.id as equipo_id,
    e.nombre as equipo_nombre,
    COUNT(p.id) as partidos_jugados,
    COUNT(CASE WHEN p.marcador_local > p.marcador_visitante AND p.equipo_local_id = e.id THEN 1 END) +
    COUNT(CASE WHEN p.marcador_visitante > p.marcador_local AND p.equipo_visitante_id = e.id THEN 1 END) as partidos_ganados,
    COUNT(CASE WHEN p.marcador_local = p.marcador_visitante THEN 1 END) as partidos_empatados,
    COUNT(CASE WHEN p.marcador_local < p.marcador_visitante AND p.equipo_local_id = e.id THEN 1 END) +
    COUNT(CASE WHEN p.marcador_visitante < p.marcador_local AND p.equipo_visitante_id = e.id THEN 1 END) as partidos_perdidos,
    SUM(CASE WHEN p.equipo_local_id = e.id THEN p.marcador_local ELSE p.marcador_visitante END) as goles_favor,
    SUM(CASE WHEN p.equipo_local_id = e.id THEN p.marcador_visitante ELSE p.marcador_local END) as goles_contra,
    (SUM(CASE WHEN p.equipo_local_id = e.id THEN p.marcador_local ELSE p.marcador_visitante END) -
     SUM(CASE WHEN p.equipo_local_id = e.id THEN p.marcador_visitante ELSE p.marcador_local END)) as diferencia_goles,
    (COUNT(CASE WHEN p.marcador_local > p.marcador_visitante AND p.equipo_local_id = e.id THEN 1 END) +
     COUNT(CASE WHEN p.marcador_visitante > p.marcador_local AND p.equipo_visitante_id = e.id THEN 1 END)) * 3 +
    COUNT(CASE WHEN p.marcador_local = p.marcador_visitante THEN 1 END) as puntos
FROM partidos p
JOIN equipos e ON (e.id = p.equipo_local_id OR e.id = p.equipo_visitante_id)
WHERE p.estado = 'jugado'
GROUP BY p.liga_id, e.id, e.nombre
ORDER BY puntos DESC, diferencia_goles DESC, goles_favor DESC;

-- ========================================
-- 5. FUNCIÓN PARA UPDATED_AT
-- ========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabla con updated_at
CREATE TRIGGER update_equipos_updated_at BEFORE UPDATE ON equipos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jugadores_updated_at BEFORE UPDATE ON jugadores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canchas_updated_at BEFORE UPDATE ON canchas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuraciones_temporada_updated_at BEFORE UPDATE ON configuraciones_temporada
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partidos_updated_at BEFORE UPDATE ON partidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. HABILITAR RLS EN TABLAS
-- ========================================

ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE canchas ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_partido ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones_temporada ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 7. POLÍTICAS DE SEGURIDAD (RLS)
-- ========================================

-- Políticas para equipos
CREATE POLICY "Usuarios pueden ver equipos de su liga" ON equipos
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND 
        liga_id IN (
            SELECT liga_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admin liga puede gestionar equipos" ON equipos
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_profiles 
            WHERE rol IN ('admin_liga', 'adminadmin') 
            AND liga_id = equipos.liga_id
        )
    );

-- Políticas para jugadores
CREATE POLICY "Usuarios pueden ver jugadores de su equipo" ON jugadores
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND 
        equipo_id IN (
            SELECT id FROM equipos WHERE liga_id IN (
                SELECT liga_id FROM user_profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Capitan puede gestionar jugadores de su equipo" ON jugadores
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_profiles 
            WHERE (es_capitan_equipo = true OR rol IN ('admin_liga', 'adminadmin'))
            AND (equipo_id = user_profiles.equipo_id OR rol IN ('admin_liga', 'adminadmin'))
        )
    );

-- Políticas para canchas
CREATE POLICY "Usuarios pueden ver canchas de su liga" ON canchas
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND 
        liga_id IN (
            SELECT liga_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admin liga puede gestionar canchas" ON canchas
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_profiles 
            WHERE rol IN ('admin_liga', 'adminadmin') 
            AND liga_id = canchas.liga_id
        )
    );

-- Políticas para partidos
CREATE POLICY "Usuarios pueden ver partidos de su liga" ON partidos
    FOR SELECT USING (
        liga_id IN (
            SELECT liga_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admin liga puede gestionar partidos" ON partidos
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_profiles 
            WHERE rol IN ('admin_liga', 'adminadmin') 
            AND liga_id = partidos.liga_id
        )
    );

-- Políticas para configuraciones
CREATE POLICY "Admin puede gestionar configuraciones" ON configuraciones_temporada
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_profiles 
            WHERE rol IN ('admin_liga', 'adminadmin') 
            AND liga_id = configuraciones_temporada.liga_id
        )
    );

-- ========================================
-- 8. VERIFICACIÓN FINAL
-- ========================================

-- Mostrar todas las tablas creadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ligas', 'equipos', 'jugadores', 'canchas', 'partidos', 'eventos_partido', 'configuraciones_temporada', 'user_profiles', 'torneos')
ORDER BY table_name;

-- Verificar relaciones
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
