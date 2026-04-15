-- Script para crear vista pública de ligas sin restricciones RLS
-- Ejecutar en el editor SQL de Supabase

-- 1. Crear vista pública que muestra todas las ligas
CREATE OR REPLACE VIEW public_ligas AS
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
  fecha_registro,
  fecha_vencimiento,
  owner_id,
  created_at,
  updated_at
FROM ligas;

-- 2. Dar permisos públicos a la vista
GRANT SELECT ON public_ligas TO anon;
GRANT SELECT ON public_ligas TO authenticated;
GRANT SELECT ON public_ligas TO service_role;

-- 3. Crear función para actualizar owner_id si es NULL
CREATE OR REPLACE FUNCTION update_league_owner()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Actualizar ligas sin owner_id asignando al primer superadmin disponible
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
  
  RAISE NOTICE 'League owners updated successfully';
END;
$$;

-- 4. Ejecutar la función para actualizar datos existentes
SELECT update_league_owner();

-- 5. Verificar la vista
SELECT 
  table_name,
  table_type,
  has_select_privilege
FROM information_schema.table_privileges 
WHERE table_name = 'public_ligas'
AND grantee IN ('anon', 'authenticated', 'service_role');

-- 6. Verificar datos actualizados
SELECT 
  id,
  nombre_liga,
  slug,
  owner_id,
  CASE 
    WHEN owner_id IS NOT NULL THEN 'Con dueño'
    ELSE 'Sin dueño'
  END as owner_status,
  activa,
  estatus_pago,
  plan,
  created_at
FROM ligas
ORDER BY created_at DESC;
