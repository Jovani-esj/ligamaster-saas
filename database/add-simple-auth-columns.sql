-- ====================================================================
-- MIGRACIÓN: AGREGAR COLUMNAS DE PERFIL A usuarios_simple
-- LigaMaster SaaS - Registro Unificado
-- ====================================================================

-- Ejecutar este script en el editor SQL de Supabase para soportar
-- el registro unificado y los campos extra del usuario.

ALTER TABLE usuarios_simple 
ADD COLUMN IF NOT EXISTS telefono TEXT,
ADD COLUMN IF NOT EXISTS fecha_nacimiento TEXT,
ADD COLUMN IF NOT EXISTS deporte_preferido TEXT,
ADD COLUMN IF NOT EXISTS nivel_juego TEXT,
ADD COLUMN IF NOT EXISTS equipo_interes TEXT,
ADD COLUMN IF NOT EXISTS posicion_preferida TEXT;

-- Comentario explicativo
COMMENT ON TABLE usuarios_simple IS 'Tabla para simulación de usuarios con campos extendidos para jugadores y administradores';

-- Verificar estructura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios_simple'
ORDER BY ordinal_position;
