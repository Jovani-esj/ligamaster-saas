-- Script MÍNIMO para arreglar RLS - solo usa columnas existentes
-- Ejecutar en el editor SQL de Supabase

-- 1. Verificar estructura actual
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'ligas'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Eliminar todas las políticas RLS existentes
DROP POLICY IF EXISTS "Los usuarios públicos pueden ver ligas activas y pagadas" ON ligas;
DROP POLICY IF EXISTS "Solo superadmins pueden insertar ligas" ON ligas;
DROP POLICY IF EXISTS "Dueños y superadmins pueden actualizar ligas" ON ligas;

-- 3. Crear política simple que permite acceso total
CREATE POLICY "Enable full access to ligas" ON ligas
  FOR ALL USING (true);

-- 4. Actualizar owner_id si es NULL
UPDATE ligas 
SET owner_id = (
  SELECT up.user_id 
  FROM user_profiles up 
  WHERE up.rol = 'superadmin' 
  AND up.activo = true 
  ORDER BY up.created_at ASC 
  LIMIT 1
)
WHERE owner_id IS NULL;

-- 5. Verificar resultado
SELECT 
  id,
  nombre_liga,
  slug,
  owner_id,
  estatus_pago,
  plan,
  created_at
FROM ligas
ORDER BY created_at DESC;
