-- Sistema Completo de Gestión de Ligas - LigaMaster SaaS
-- Ejecutar en el editor SQL de Supabase

-- ========================================
-- 1. TABLAS PRINCIPALES (si no existen)
-- ========================================

-- Tabla de Ligas (ya existe, pero verificamos estructura)
CREATE TABLE IF NOT EXISTS ligas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_liga VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    descripcion TEXT,
    owner_id UUID REFERENCES user_profiles(user_id),
    estatus_pago BOOLEAN DEFAULT false,
    activa BOOLEAN DEFAULT true,
    plan VARCHAR(50) DEFAULT 'Bronce',
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_vencimiento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. NUEVAS TABLAS PARA EQUIPOS
-- ========================================

-- Tabla de Equipos
CREATE TABLE IF NOT EXISTS equipos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    color_primario VARCHAR(7) DEFAULT '#000000',
    color_secundario VARCHAR(7) DEFAULT '#FFFFFF',
    capitan_id UUID REFERENCES user_profiles(user_id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(liga_id, nombre)
);

-- Tabla de Jugadores
CREATE TABLE IF NOT EXISTS jugadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
    user_profile_id UUID REFERENCES user_profiles(id), -- Si está registrado
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255),
    email VARCHAR(255),
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    numero_camiseta INTEGER,
    posicion VARCHAR(50), -- 'portero', 'defensa', 'medio', 'delantero'
    foto_url VARCHAR(500),
    activo BOOLEAN DEFAULT true,
    es_capitan BOOLEAN DEFAULT false,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_jugador_equipo UNIQUE(equipo_id, email),
    CONSTRAINT unique_jugador_perfil UNIQUE(user_profile_id)
);

-- ========================================
-- 3. TABLAS PARA CANCHAS
-- ========================================

-- Tabla de Canchas
CREATE TABLE IF NOT EXISTS canchas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    tipo VARCHAR(50) DEFAULT 'futbol', -- 'futbol', 'futbol_5', 'futbol_7', 'futbol_11'
    superficie VARCHAR(50) DEFAULT 'natural', -- 'natural', 'sintetico', 'cemento'
    capacidad_espectadores INTEGER DEFAULT 0,
    tiene_iluminacion BOOLEAN DEFAULT false,
    tiene_vestuarios BOOLEAN DEFAULT false,
    precio_hora DECIMAL(10,2) DEFAULT 0,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(liga_id, nombre)
);

-- ========================================
-- 4. TABLAS PARA PARTIDOS Y PROGRAMACIÓN
-- ========================================

-- Tabla de Partidos
CREATE TABLE IF NOT EXISTS partidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
    equipo_local_id UUID NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
    equipo_visitante_id UUID NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
    cancha_id UUID REFERENCES canchas(id),
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    duracion_minutos INTEGER DEFAULT 90,
    estado VARCHAR(20) DEFAULT 'programado', -- 'programado', 'en_juego', 'finalizado', 'suspendido', 'cancelado'
    goles_local INTEGER DEFAULT 0,
    goles_visitante INTEGER DEFAULT 0,
    jornada INTEGER,
    observaciones TEXT,
    creado_por UUID REFERENCES user_profiles(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT equipos_diferentes CHECK (equipo_local_id != equipo_visitante_id)
);

-- Tabla de Eventos de Partido
CREATE TABLE IF NOT EXISTS eventos_partido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partido_id UUID NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
    jugador_id UUID REFERENCES jugadores(id),
    equipo_id UUID REFERENCES equipos(id),
    tipo_evento VARCHAR(20) NOT NULL, -- 'gol', 'tarjeta_amarilla', 'tarjeta_roja', 'cambio', 'lesion'
    minuto INTEGER,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. TABLAS PARA PROGRAMACIÓN AUTOMÁTICA
-- ========================================

-- Tabla de Configuración de Temporada
CREATE TABLE IF NOT EXISTS configuraciones_temporada (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
    nombre_temporada VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_juego TEXT[], -- ['lunes', 'miercoles', 'viernes']
    hora_inicio TIME NOT NULL, -- '19:00:00'
    hora_fin TIME NOT NULL, -- '23:00:00'
    intervalo_minutos INTEGER DEFAULT 90, -- Tiempo entre partidos
    formato VARCHAR(20) DEFAULT 'todos_contra_todos', -- 'todos_contra_todos', 'eliminacion_directa'
    vueltas INTEGER DEFAULT 1, -- 1 = ida, 2 = ida y vuelta
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. ACTUALIZAR TABLA user_profiles
-- ========================================

-- Agregar nuevas columnas a user_profiles si no existen
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS equipo_id UUID REFERENCES equipos(id),
ADD COLUMN IF NOT EXISTS es_capitan_equipo BOOLEAN DEFAULT false;

-- ========================================
-- 7. ÍNDICES PARA MEJORAR RENDIMIENTO
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
-- 8. POLÍTICAS DE SEGURIDAD (RLS)
-- ========================================

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE canchas ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_partido ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones_temporada ENABLE ROW LEVEL SECURITY;

-- Políticas para Equipos
CREATE POLICY "Los usuarios pueden ver equipos de ligas públicas" ON equipos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ligas 
            WHERE ligas.id = equipos.liga_id 
            AND ligas.activa = true 
            AND ligas.estatus_pago = true
        )
    );

CREATE POLICY "Admin de liga puede gestionar equipos" ON equipos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.rol IN ('superadmin', 'admin_liga')
            AND (
                up.rol = 'superadmin' 
                OR (up.rol = 'admin_liga' AND up.liga_id = equipos.liga_id)
            )
        )
    );

CREATE POLICY "Capitán puede gestionar su equipo" ON equipos
    FOR UPDATE USING (
        capitan_id = auth.uid()
    );

-- Políticas para Jugadores
CREATE POLICY "Los usuarios pueden ver jugadores de ligas públicas" ON jugadores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM equipos e
            JOIN ligas l ON l.id = e.liga_id
            WHERE e.id = jugadores.equipo_id 
            AND l.activa = true 
            AND l.estatus_pago = true
        )
    );

CREATE POLICY "Admin de liga puede gestionar jugadores" ON jugadores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.rol IN ('superadmin', 'admin_liga')
            AND (
                up.rol = 'superadmin' 
                OR (up.rol = 'admin_liga' AND up.liga_id = jugadores.equipo_id)
            )
        )
    );

CREATE POLICY "Capitán puede gestionar jugadores de su equipo" ON jugadores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM equipos e
            WHERE e.id = jugadores.equipo_id 
            AND e.capitan_id = auth.uid()
        )
    );

-- Políticas para Canchas
CREATE POLICY "Los usuarios pueden ver canchas de ligas públicas" ON canchas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ligas 
            WHERE ligas.id = canchas.liga_id 
            AND ligas.activa = true 
            AND ligas.estatus_pago = true
        )
    );

CREATE POLICY "Admin de liga puede gestionar canchas" ON canchas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.rol IN ('superadmin', 'admin_liga')
            AND (
                up.rol = 'superadmin' 
                OR (up.rol = 'admin_liga' AND up.liga_id = canchas.liga_id)
            )
        )
    );

-- Políticas para Partidos
CREATE POLICY "Todos pueden ver partidos de ligas públicas" ON partidos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ligas 
            WHERE ligas.id = partidos.liga_id 
            AND ligas.activa = true 
            AND ligas.estatus_pago = true
        )
    );

CREATE POLICY "Admin de liga puede gestionar partidos" ON partidos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.rol IN ('superadmin', 'admin_liga')
            AND (
                up.rol = 'superadmin' 
                OR (up.rol = 'admin_liga' AND up.liga_id = partidos.liga_id)
            )
        )
    );

-- Políticas para Configuraciones de Temporada
CREATE POLICY "Admin de liga puede gestionar configuraciones" ON configuraciones_temporada
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.rol IN ('superadmin', 'admin_liga')
            AND (
                up.rol = 'superadmin' 
                OR (up.rol = 'admin_liga' AND up.liga_id = configuraciones_temporada.liga_id)
            )
        )
    );

-- ========================================
-- 9. TRIGGERS PARA UPDATED_AT
-- ========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabla
CREATE TRIGGER update_equipos_updated_at BEFORE UPDATE ON equipos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jugadores_updated_at BEFORE UPDATE ON jugadores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canchas_updated_at BEFORE UPDATE ON canchas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partidos_updated_at BEFORE UPDATE ON partidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuraciones_temporada_updated_at BEFORE UPDATE ON configuraciones_temporada
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 10. VISTAS ÚTILES
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
-- 11. DATOS DE EJEMPLO (opcional)
-- ========================================

-- Insertar roles adicionales si no existen
INSERT INTO user_profiles (user_id, rol, activo) VALUES 
('mindostech@gmail.com', 'adminadmin', true)
ON CONFLICT (user_id) DO UPDATE SET rol = 'adminadmin';

-- ========================================
-- 12. VERIFICACIÓN FINAL
-- ========================================

-- Mostrar todas las tablas creadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ligas', 'equipos', 'jugadores', 'canchas', 'partidos', 'eventos_partido', 'configuraciones_temporada', 'user_profiles')
ORDER BY table_name;
