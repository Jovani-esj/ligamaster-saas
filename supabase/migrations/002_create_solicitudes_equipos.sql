-- Tabla de solicitudes de equipos para unirse a ligas
-- Creado: 2024-04-16

CREATE TABLE IF NOT EXISTS solicitudes_equipos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
    capitan_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    equipo_id UUID REFERENCES equipos(id) ON DELETE SET NULL,
    nombre_equipo VARCHAR(255) NOT NULL,
    logo_url TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
    mensaje TEXT,
    respuesta_admin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_solicitudes_equipos_liga_id ON solicitudes_equipos(liga_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_equipos_capitan_id ON solicitudes_equipos(capitan_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_equipos_equipo_id ON solicitudes_equipos(equipo_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_equipos_estado ON solicitudes_equipos(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_equipos_created_at ON solicitudes_equipos(created_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_solicitudes_equipos_updated_at ON solicitudes_equipos;
CREATE TRIGGER update_solicitudes_equipos_updated_at
    BEFORE UPDATE ON solicitudes_equipos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad (RLS) para Supabase
ALTER TABLE solicitudes_equipos ENABLE ROW LEVEL SECURITY;

-- Los admins de liga pueden ver solicitudes de sus ligas
CREATE POLICY "Admins de liga pueden ver solicitudes de sus ligas"
    ON solicitudes_equipos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ligas 
            WHERE ligas.id = solicitudes_equipos.liga_id 
            AND ligas.owner_id = auth.uid()
        )
    );

-- Los admins de liga pueden actualizar solicitudes de sus ligas
CREATE POLICY "Admins de liga pueden actualizar solicitudes de sus ligas"
    ON solicitudes_equipos
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM ligas 
            WHERE ligas.id = solicitudes_equipos.liga_id 
            AND ligas.owner_id = auth.uid()
        )
    );

-- Los capitanes pueden ver sus propias solicitudes
CREATE POLICY "Capitanes pueden ver sus propias solicitudes"
    ON solicitudes_equipos
    FOR SELECT
    USING (capitan_id = auth.uid());

-- Los capitanes pueden crear solicitudes
CREATE POLICY "Capitanes pueden crear solicitudes"
    ON solicitudes_equipos
    FOR INSERT
    WITH CHECK (capitan_id = auth.uid());

-- Superadmins pueden ver todas las solicitudes
CREATE POLICY "Superadmins pueden ver todas las solicitudes"
    ON solicitudes_equipos
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.rol IN ('superadmin', 'adminadmin')
        )
    );

COMMENT ON TABLE solicitudes_equipos IS 'Solicitudes de equipos para unirse a ligas';
COMMENT ON COLUMN solicitudes_equipos.liga_id IS 'ID de la liga a la que se solicita unirse';
COMMENT ON COLUMN solicitudes_equipos.capitan_id IS 'ID del usuario capitán que solicita';
COMMENT ON COLUMN solicitudes_equipos.equipo_id IS 'ID del equipo creado tras aprobación (nullable hasta aprobación)';
COMMENT ON COLUMN solicitudes_equipos.nombre_equipo IS 'Nombre propuesto para el equipo';
COMMENT ON COLUMN solicitudes_equipos.estado IS 'Estado de la solicitud: pendiente, aprobada, rechazada';
COMMENT ON COLUMN solicitudes_equipos.mensaje IS 'Mensaje del capitán al admin';
COMMENT ON COLUMN solicitudes_equipos.respuesta_admin IS 'Respuesta del admin al rechazar/aprobar';
