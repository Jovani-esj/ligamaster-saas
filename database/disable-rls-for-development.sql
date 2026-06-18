-- ====================================================================
-- MIGRACIÓN: DESHABILITAR RLS PARA DESARROLLO (SIMPLE AUTH)
-- LigaMaster SaaS
-- ====================================================================

-- Ejecutar este script en el editor SQL de Supabase para permitir que 
-- la clave anónima (que es la única válida en tu .env.local) 
-- pueda realizar el inicio de sesión y registro sin requerir Service Role Key.

ALTER TABLE usuarios_simple DISABLE ROW LEVEL SECURITY;
ALTER TABLE ligas DISABLE ROW LEVEL SECURITY;
ALTER TABLE pagos DISABLE ROW LEVEL SECURITY;

-- Opcional: Asegurar que las políticas existentes no interfieran si RLS se vuelve a activar
DROP POLICY IF EXISTS "Users can view their own simple user" ON usuarios_simple;
DROP POLICY IF EXISTS "Users can insert simple users" ON usuarios_simple;
DROP POLICY IF EXISTS "Users can update simple users" ON usuarios_simple;

CREATE POLICY "Enable read access for all users" ON usuarios_simple FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON usuarios_simple FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON usuarios_simple FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable full access to ligas" ON ligas;
CREATE POLICY "Enable full access to ligas" ON ligas FOR ALL USING (true);

DROP POLICY IF EXISTS "Solo superadmins pueden ver pagos" ON pagos;
DROP POLICY IF EXISTS "Solo superadmins pueden insertar pagos" ON pagos;
CREATE POLICY "Enable full access to pagos" ON pagos FOR ALL USING (true);

SELECT 'RLS deshabilitado y políticas de desarrollo creadas con éxito' as status;
