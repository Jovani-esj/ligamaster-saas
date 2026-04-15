-- Script para arreglar RLS policies en tabla ligas
-- Ejecutar en el editor SQL de Supabase

-- 1. Eliminar políticas RLS existentes que causan problemas
DROP POLICY IF EXISTS "Los usuarios públicos pueden ver ligas activas y pagadas" ON ligas;
DROP POLICY IF EXISTS "Solo superadmins pueden insertar ligas" ON ligas;
DROP POLICY IF EXISTS "Dueños y superadmins pueden actualizar ligas" ON ligas;

-- 2. Crear nuevas políticas RLS corregidas

-- Política para que CUALQUIER USUARIO AUTENTICADO pueda ver todas las ligas
CREATE POLICY "Authenticated users can view all leagues" ON ligas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para que solo superadmins puedan insertar ligas
CREATE POLICY "Only superadmins can insert leagues" ON ligas
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'superadmin');

-- Política para que dueños y superadmins puedan actualizar ligas
CREATE POLICY "Owners and superadmins can update leagues" ON ligas
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'superadmin' OR 
    auth.uid() = owner_id
  );

-- Política para que solo superadmins puedan eliminar ligas
CREATE POLICY "Only superadmins can delete leagues" ON ligas
  FOR DELETE USING (auth.jwt() ->> 'role' = 'superadmin');

-- 3. Actualizar owner_id de la liga existente si es NULL
UPDATE ligas 
SET owner_id = (
  SELECT id FROM user_profiles 
  WHERE rol = 'superadmin' 
  AND activo = true 
  LIMIT 1
)
WHERE owner_id IS NULL;

-- 4. Verificar las políticas nuevas
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

-- 5. Verificar datos de ligas
SELECT 
  id,
  nombre_liga,
  slug,
  owner_id,
  activa,
  estatus_pago,
  plan,
  created_at
FROM ligas
ORDER BY created_at DESC;

-- 6. Opcional: Crear vista pública para ligas (sin RLS)
-- Descomentar si prefieres usar vista en lugar de políticas
/*
CREATE OR REPLACE VIEW public_ligas_view AS
SELECT 
  id,
  nombre_liga,
  slug,
  descripcion,
  logo_url,
  plan,
  estatus_pago,
  activa,
  contacto_email,
  contacto_telefono,
  created_at,
  updated_at
FROM ligas;

-- Y dar permisos públicos a la vista
GRANT SELECT ON public_ligas_view TO anon, authenticated;
*/
