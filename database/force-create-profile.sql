-- Script para forzar la creación/corrección del perfil de mindostech@gmail.com
-- Esto debería resolver el problema de "Perfil no encontrado"

-- Primero, eliminar cualquier perfil existente para este user_id (limpieza)
DELETE FROM user_profiles 
WHERE user_id = '9d7b6b96-ae99-4eab-b336-14dae92f6858';

-- Luego, insertar el perfil correcto con rol adminadmin
INSERT INTO user_profiles (
    user_id,
    nombre,
    apellido,
    rol,
    activo,
    created_at,
    updated_at
) VALUES (
    '9d7b6b96-ae99-4eab-b336-14dae92f6858',
    'Admin',
    'Master',
    'adminadmin',
    true,
    NOW(),
    NOW()
);

-- Verificar que se creó correctamente
SELECT 
    'Perfil creado/actualizado:' as status,
    up.id,
    up.user_id,
    up.nombre,
    up.apellido,
    up.rol,
    up.activo,
    au.email as auth_email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'mindostech@gmail.com';
