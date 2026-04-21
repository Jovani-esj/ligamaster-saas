-- Desactivar temporalmente constraints de claves foráneas que apuntan a auth.users o public.users 
-- ya que el sistema utiliza 'usuarios_simple'

-- 1. solicitudes_equipos
ALTER TABLE public.solicitudes_equipos 
DROP CONSTRAINT IF EXISTS solicitudes_equipos_capitan_id_fkey;

-- Si apunta a public.user_profiles en lugar de auth.users:
ALTER TABLE public.solicitudes_equipos
DROP CONSTRAINT IF EXISTS solicitudes_equipos_user_profile_id_fkey;

-- 2. equipos
ALTER TABLE public.equipos
DROP CONSTRAINT IF EXISTS equipos_capitan_id_fkey;

-- 3. canchas (por si acaso no se corrió antes)
ALTER TABLE public.canchas
DROP CONSTRAINT IF EXISTS canchas_owner_id_fkey;

-- 4. ligas
ALTER TABLE public.ligas
DROP CONSTRAINT IF EXISTS ligas_owner_id_fkey;

-- Opcional: Crear las llaves foráneas apuntando a la tabla correcta (usuarios_simple)
-- Nota: Solo ejecuta esto si estás 100% seguro de que todos los IDs actuales existen en usuarios_simple
/*
ALTER TABLE public.solicitudes_equipos
ADD CONSTRAINT solicitudes_equipos_capitan_id_fkey FOREIGN KEY (capitan_id) REFERENCES public.usuarios_simple(id) ON DELETE CASCADE;

ALTER TABLE public.equipos
ADD CONSTRAINT equipos_capitan_id_fkey FOREIGN KEY (capitan_id) REFERENCES public.usuarios_simple(id) ON DELETE SET NULL;
*/
