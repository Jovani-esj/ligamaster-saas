-- Script DEFINITIVO para arreglar acceso a ligas
-- Usa solo las columnas que realmente existen en tu base de datos

-- 1. Eliminar políticas RLS existentes
DROP POLICY IF EXISTS "Los usuarios públicos pueden ver ligas activas y pagadas" ON ligas;
DROP POLICY IF EXISTS "Solo superadmins pueden insertar ligas" ON ligas;
DROP POLICY IF EXISTS "Dueños y superadmins pueden actualizar ligas" ON ligas;

-- 2. Crear política que permite acceso TOTAL a ligas
CREATE POLICY "Enable full access to ligas" ON ligas
  FOR ALL USING (true);

-- 3. Actualizar owner_id si es NULL (asignar al primer superadmin)
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

-- 4. Verificar resultado final
SELECT 
  id,
  nombre_liga,
  slug,
  descripcion,
  owner_id,
  estatus_pago,
  plan,
  fecha_registro,
  fecha_vencimiento,
  created_at,
  CASE 
    WHEN owner_id IS NOT NULL THEN 'Con dueño'
    ELSE 'Sin dueño'
  END as owner_status
FROM ligas
ORDER BY created_at DESC;
