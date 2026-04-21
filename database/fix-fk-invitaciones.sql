-- Reparar la clave foránea (Foreign Key) de invitaciones_capitanes
-- Actualmente apunta a la tabla 'users' (auth.users o public.users),
-- pero el sistema está utilizando 'usuarios_simple' para la autenticación.

-- 1. Eliminar la restricción incorrecta
ALTER TABLE public.invitaciones_capitanes
DROP CONSTRAINT IF EXISTS invitaciones_capitanes_capitan_id_fkey;

-- 2. Crear la restricción apuntando a usuarios_simple
-- (Aseguramos que los IDs apuntarán a la tabla correcta)
ALTER TABLE public.invitaciones_capitanes
ADD CONSTRAINT invitaciones_capitanes_capitan_id_fkey 
FOREIGN KEY (capitan_id) REFERENCES public.usuarios_simple(id) ON DELETE SET NULL;
