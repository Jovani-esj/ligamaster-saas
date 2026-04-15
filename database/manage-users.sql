-- Script para gestionar usuarios existentes y crear administrador
-- Ejecutar en el editor SQL de Supabase

-- 1. Verificar usuarios existentes en auth.users
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users 
WHERE email IN ('jovasan1342@gmail.com', 'mindostech@gmail.com');

-- 2. Verificar perfiles existentes en user_profiles
SELECT 
  up.id,
  up.user_id,
  up.nombre,
  up.apellido,
  up.rol,
  up.activo,
  au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN ('jovasan1342@gmail.com', 'mindostech@gmail.com');

-- 3. Crear o actualizar perfil para usuario regular jovasan1342@gmail.com
INSERT INTO user_profiles (user_id, nombre, apellido, rol, activo)
SELECT 
  au.id,
  'Usuario',
  'Regular',
  'usuario',
  true
FROM auth.users au
WHERE au.email = 'jovasan1342@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.user_id = au.id
);

-- 4. Crear usuario administrador mindostech@gmail.com si no existe
-- Primero creamos el usuario en auth.users (esto requiere el service role)
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
)
SELECT 
  gen_random_uuid(),
  'mindostech@gmail.com',
  NOW(),
  NOW(),
  NOW(),
  jsonb_build_object('role', 'superadmin')
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'mindostech@gmail.com'
);

-- 5. Crear perfil de superadmin para mindostech@gmail.com
INSERT INTO user_profiles (user_id, nombre, apellido, rol, activo)
SELECT 
  au.id,
  'Admin',
  'LigaMaster',
  'superadmin',
  true
FROM auth.users au
WHERE au.email = 'mindostech@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.user_id = au.id
);

-- 6. Actualizar rol a superadmin si el perfil ya existe
UPDATE user_profiles 
SET rol = 'superadmin', activo = true
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'mindostech@gmail.com'
);

-- 7. Establecer contraseña para el usuario admin (esto se hace via RPC o signup)
-- Nota: La contraseña se debe establecer a través del endpoint de signup o RPC
-- Por ahora, el usuario necesitará usar "Forgot Password" o registrarse normalmente

-- 8. Verificación final - mostrar todos los usuarios y sus roles
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at,
  up.nombre,
  up.apellido,
  up.rol as rol_perfil,
  up.activo as perfil_activo,
  CASE 
    WHEN au.raw_user_meta_data ->> 'role' = 'superadmin' THEN 'SuperAdmin (Auth)'
    WHEN up.rol = 'superadmin' THEN 'SuperAdmin (Perfil)'
    WHEN up.rol = 'admin_liga' THEN 'Admin Liga'
    ELSE 'Usuario Regular'
  END as rol_final
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email IN ('jovasan1342@gmail.com', 'mindostech@gmail.com')
ORDER BY au.email;

-- 9. Para establecer la contraseña del admin, ejecuta esta función RPC
-- (descomentar y ejecutar si necesitas resetear la contraseña)
/*
SELECT set_password('mindostech@gmail.com', '123456');
*/

-- 10. Función auxiliar para establecer contraseñas (ejecutar una sola vez)
CREATE OR REPLACE FUNCTION set_password(user_email text, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Actualizar la contraseña del usuario
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE email = user_email;
  
  -- Marcar como confirmado
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE email = user_email;
  
  RETURN true;
END;
$$;
