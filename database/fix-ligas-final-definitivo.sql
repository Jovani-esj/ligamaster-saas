-- Script FINAL DEFINITIVO - 100% basado en tu esquema real
-- Ejecutar en el editor SQL de Supabase

-- 1. Eliminar todas las políticas RLS existentes
DROP POLICY IF EXISTS "Los usuarios públicos pueden ver ligas activas y pagadas" ON ligas;
DROP POLICY IF EXISTS "Solo superadmins pueden insertar ligas" ON ligas;
DROP POLICY IF EXISTS "Dueños y superadmins pueden actualizar ligas" ON ligas;

-- 2. Crear política que permite acceso TOTAL sin restricciones
CREATE POLICY "Enable full access to ligas" ON ligas
  FOR ALL USING (true);

-- 3. Actualizar owner_id si es NULL (asignar al primer superadmin disponible)
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

-- 4. Verificar resultado final con columnas CORRECTAS
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
  CASE 
    WHEN owner_id IS NOT NULL THEN 'Con dueño'
    ELSE 'Sin dueño'
  END as owner_status
FROM ligas
ORDER BY fecha_registro DESC;
