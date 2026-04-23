-- Script corregido SIN columna activa para tabla ligas
-- Basado en el esquema real de la base de datos

-- 1. Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'ligas'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Eliminar políticas RLS existentes
DROP POLICY IF EXISTS "Los usuarios públicos pueden ver ligas activas y pagadas" ON ligas;
DROP POLICY IF EXISTS "Solo superadmins pueden insertar ligas" ON ligas;
DROP POLICY IF EXISTS "Dueños y superadmins pueden actualizar ligas" ON ligas;

-- 3. Crear nuevas políticas RLS corregidas (SIN activa)

-- Política para que CUALQUIER USUARIO pueda ver todas las ligas
CREATE POLICY "Enable public read access to ligas" ON ligas
  FOR SELECT USING (true);

-- Política para que usuarios autenticados puedan insertar ligas
CREATE POLICY "Enable authenticated insert for ligas" ON ligas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para que usuarios puedan actualizar sus propias ligas o superadmins todas
CREATE POLICY "Enable users to update own leagues or superadmins all" ON ligas
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'superadmin' OR 
    auth.uid() = owner_id
  );

-- Política para que solo superadmins puedan eliminar ligas
CREATE POLICY "Enable superadmins to delete leagues" ON ligas
  FOR DELETE USING (auth.jwt() ->> 'role' = 'superadmin');

-- 4. Actualizar owner_id de la liga existente si es NULL
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

-- 5. Crear vista pública sin RLS
CREATE OR REPLACE VIEW public_all_ligas AS
SELECT 
  id,
  nombre_liga,
  slug,
  descripcion,
  plan,
  estatus_pago,
  contacto_email,
  contacto_telefono,
  fecha_registro,
  fecha_vencimiento,
  owner_id,
  created_at,
  updated_at
FROM ligas;

-- 6. Dar permisos públicos a la vista
GRANT SELECT ON public_all_ligas TO anon;
GRANT SELECT ON public_all_ligas TO authenticated;
GRANT SELECT ON public_all_ligas TO service_role;

-- 7. Verificar las políticas nuevas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'ligas'
ORDER BY policyname;

-- 8. Verificar datos de ligas después de actualización
SELECT 
  id,
  nombre_liga,
  slug,
  owner_id,
  CASE 
    WHEN owner_id IS NOT NULL THEN 'Con dueño'
    ELSE 'Sin dueño'
  END as owner_status,
  estatus_pago,
  plan,
  created_at
FROM ligas
ORDER BY created_at DESC;
