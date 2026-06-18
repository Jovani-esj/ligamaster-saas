-- ====================================================================
-- MIGRACIÓN: AÑADIR ROL DE ÁRBITRO Y AJUSTES DE BASE DE DATOS
-- LigaMaster SaaS
-- ====================================================================

-- 1. Modificar restricción CHECK en usuarios_simple para admitir 'arbitro'
ALTER TABLE usuarios_simple DROP CONSTRAINT IF EXISTS usuarios_simple_rol_check;
ALTER TABLE usuarios_simple ADD CONSTRAINT usuarios_simple_rol_check CHECK (rol IN ('superadmin', 'adminadmin', 'admin_liga', 'capitan_equipo', 'usuario', 'arbitro'));

-- 3. Añadir columna liga_id a usuarios_simple para relacionar árbitros/usuarios a una liga
ALTER TABLE usuarios_simple ADD COLUMN IF NOT EXISTS liga_id UUID REFERENCES ligas(id) ON DELETE SET NULL;

-- 4. Añadir columna arbitro_id a partidos para asignar un árbitro a un juego
ALTER TABLE partidos ADD COLUMN IF NOT EXISTS arbitro_id UUID REFERENCES usuarios_simple(id) ON DELETE SET NULL;

-- 5. Deshabilitar RLS para desarrollo en todas las tablas para evitar fallos de carga infinita
ALTER TABLE ligas DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipos DISABLE ROW LEVEL SECURITY;
ALTER TABLE jugadores DISABLE ROW LEVEL SECURITY;
ALTER TABLE canchas DISABLE ROW LEVEL SECURITY;
ALTER TABLE partidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE torneos DISABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_partido DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones_temporada DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_simple DISABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_equipos DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitaciones_capitanes DISABLE ROW LEVEL SECURITY;
ALTER TABLE liga_canchas DISABLE ROW LEVEL SECURITY;

SELECT 'Migración de árbitros y RLS completada con éxito' as status;
