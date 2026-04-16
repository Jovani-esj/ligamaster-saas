-- Tabla de invitaciones de liga a capitanes (admin invita a capitan)
-- Creado: 2024-04-16

CREATE TABLE IF NOT EXISTS invitaciones_capitanes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    liga_id UUID NOT NULL REFERENCES ligas(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(255),
    telefono VARCHAR(50),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada', 'expirada')),
    token VARCHAR(255) NOT NULL UNIQUE,
    capitan_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    equipo_id UUID REFERENCES equipos(id) ON DELETE SET NULL,
    nombre_equipo VARCHAR(255),
    mensaje TEXT,
    respuesta TEXT,
    fecha_expiracion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_invitaciones_capitanes_liga_id ON invitaciones_capitanes(liga_id);
CREATE INDEX IF NOT EXISTS idx_invitaciones_capitanes_email ON invitaciones_capitanes(email);
CREATE INDEX IF NOT EXISTS idx_invitaciones_capitanes_token ON invitaciones_capitanes(token);
CREATE INDEX IF NOT EXISTS idx_invitaciones_capitanes_estado ON invitaciones_capitanes(estado);
CREATE INDEX IF NOT EXISTS idx_invitaciones_capitanes_capitan_id ON invitaciones_capitanes(capitan_id);
CREATE INDEX IF NOT EXISTS idx_invitaciones_capitanes_created_at ON invitaciones_capitanes(created_at DESC);

-- Constraint única para evitar invitaciones duplicadas pendientes
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitaciones_unica_pendiente 
ON invitaciones_capitanes(liga_id, email) 
WHERE estado = 'pendiente';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_invitaciones_capitanes_updated_at ON invitaciones_capitanes;
CREATE TRIGGER update_invitaciones_capitanes_updated_at
    BEFORE UPDATE ON invitaciones_capitanes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad (RLS) para Supabase
ALTER TABLE invitaciones_capitanes ENABLE ROW LEVEL SECURITY;

-- Los admins de liga pueden ver invitaciones de sus ligas
CREATE POLICY "Admins de liga pueden ver invitaciones de sus ligas"
    ON invitaciones_capitanes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ligas 
            WHERE ligas.id = invitaciones_capitanes.liga_id 
            AND ligas.owner_id = auth.uid()
        )
    );

-- Los admins de liga pueden crear invitaciones
CREATE POLICY "Admins de liga pueden crear invitaciones"
    ON invitaciones_capitanes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ligas 
            WHERE ligas.id = invitaciones_capitanes.liga_id 
            AND ligas.owner_id = auth.uid()
        )
    );

-- Los admins de liga pueden actualizar invitaciones de sus ligas
CREATE POLICY "Admins de liga pueden actualizar invitaciones de sus ligas"
    ON invitaciones_capitanes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM ligas 
            WHERE ligas.id = invitaciones_capitanes.liga_id 
            AND ligas.owner_id = auth.uid()
        )
    );

-- Los admins de liga pueden eliminar invitaciones pendientes
CREATE POLICY "Admins de liga pueden eliminar invitaciones"
    ON invitaciones_capitanes
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM ligas 
            WHERE ligas.id = invitaciones_capitanes.liga_id 
            AND ligas.owner_id = auth.uid()
        )
        AND estado = 'pendiente'
    );

-- Cualquiera puede ver invitaciones por email (para aceptar invitación)
CREATE POLICY "Cualquiera puede ver invitaciones por email"
    ON invitaciones_capitanes
    FOR SELECT
    USING (email = auth.email() OR email = auth.jwt()->>'email');

-- Superadmins pueden ver todas las invitaciones
CREATE POLICY "Superadmins pueden ver todas las invitaciones"
    ON invitaciones_capitanes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.rol IN ('superadmin', 'adminadmin')
        )
    );

COMMENT ON TABLE invitaciones_capitanes IS 'Invitaciones enviadas por admins de liga a capitanes potenciales';
COMMENT ON COLUMN invitaciones_capitanes.liga_id IS 'ID de la liga que envía la invitación';
COMMENT ON COLUMN invitaciones_capitanes.email IS 'Email del capitan invitado';
COMMENT ON COLUMN invitaciones_capitanes.estado IS 'Estado: pendiente, aceptada, rechazada, expirada';
COMMENT ON COLUMN invitaciones_capitanes.token IS 'Token único para aceptar la invitación';
COMMENT ON COLUMN invitaciones_capitanes.capitan_id IS 'ID del usuario capitan una vez acepta (nullable hasta aceptación)';
COMMENT ON COLUMN invitaciones_capitanes.equipo_id IS 'ID del equipo creado tras aceptación';
COMMENT ON COLUMN invitaciones_capitanes.nombre_equipo IS 'Nombre propuesto para el equipo';
