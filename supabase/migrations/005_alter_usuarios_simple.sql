-- Agregar campos necesarios a usuarios_simple para gestión de capitanes y equipos
-- Creado: 2024-04-16

-- Agregar campos para gestión de ligas y equipos
ALTER TABLE usuarios_simple 
ADD COLUMN IF NOT EXISTS liga_id UUID REFERENCES ligas(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS equipo_id UUID REFERENCES equipos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS es_capitan_equipo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS telefono VARCHAR(50),
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;

-- Crear índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_usuarios_simple_liga_id ON usuarios_simple(liga_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_simple_equipo_id ON usuarios_simple(equipo_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_simple_es_capitan ON usuarios_simple(es_capitan_equipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_simple_rol ON usuarios_simple(rol);

-- Actualizar RLS policies para usuarios_simple
ALTER TABLE usuarios_simple ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios pueden ver su propio registro
DROP POLICY IF EXISTS "Users can view own record" ON usuarios_simple;
CREATE POLICY "Users can view own record"
    ON usuarios_simple
    FOR SELECT
    USING (id = auth.uid());

-- Política: Admins de liga pueden ver usuarios de su liga
DROP POLICY IF EXISTS "Admins de liga pueden ver usuarios de su liga" ON usuarios_simple;
CREATE POLICY "Admins de liga pueden ver usuarios de su liga"
    ON usuarios_simple
    FOR SELECT
    USING (
        liga_id IS NOT NULL 
        AND liga_id IN (
            SELECT id FROM ligas WHERE owner_id = auth.uid()
        )
    );

-- Política: Capitanes pueden ver usuarios de su equipo
DROP POLICY IF EXISTS "Capitanes pueden ver usuarios de su equipo" ON usuarios_simple;
CREATE POLICY "Capitanes pueden ver usuarios de su equipo"
    ON usuarios_simple
    FOR SELECT
    USING (
        equipo_id IS NOT NULL 
        AND equipo_id IN (
            SELECT equipo_id FROM usuarios_simple WHERE id = auth.uid() AND es_capitan_equipo = true
        )
    );

-- Política: Superadmins pueden ver todos los usuarios
DROP POLICY IF EXISTS "Superadmins pueden ver todos los usuarios" ON usuarios_simple;
CREATE POLICY "Superadmins pueden ver todos los usuarios"
    ON usuarios_simple
    FOR ALL
    USING (
        rol IN ('superadmin', 'adminadmin')
        OR id = auth.uid()
    );

-- Política: Usuarios pueden actualizar su propio registro
DROP POLICY IF EXISTS "Users can update own record" ON usuarios_simple;
CREATE POLICY "Users can update own record"
    ON usuarios_simple
    FOR UPDATE
    USING (id = auth.uid());

COMMENT ON TABLE usuarios_simple IS 'Tabla principal de usuarios con campos extendidos para ligas y equipos';
