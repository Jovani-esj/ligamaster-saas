-- Script simplificado para reparar el problema de perfiles
-- Adaptado exactamente a tu estructura de tabla sin columnas inexistentes

-- ========================================
-- 1. VERIFICACIÓN ACTUAL
-- ========================================

-- Ver estado actual de perfiles vs auth.users
SELECT 
    up.id,
    up.user_id,
    up.nombre,
    up.apellido,
    up.rol,
    up.activo,
    au.email as auth_email,
    CASE 
        WHEN au.id IS NOT NULL THEN 'OK'
        ELSE 'SIN_AUTH'
    END as status
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at;

-- Contar problemas
SELECT 
    'Estado actual' as info,
    COUNT(*) as total_perfiles,
    COUNT(CASE WHEN au.id IS NOT NULL THEN 1 END) as con_auth_valido,
    COUNT(CASE WHEN au.id IS NULL THEN 1 END) as sin_auth_valido
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id;

-- ========================================
-- 2. REPARACIÓN ESPECÍFICA PARA mindostech@gmail.com
-- ========================================

-- Primero verificar si el usuario existe en auth.users
SELECT 'Verificando usuario mindostech@gmail.com:' as info,
       au.id as auth_user_id,
       au.email,
       au.created_at
FROM auth.users au
WHERE au.email = 'mindostech@gmail.com';

-- Si el usuario existe, asegurarse que tenga perfil correcto
UPDATE user_profiles 
SET user_id = au.id,
    rol = 'adminadmin',
    activo = true,
    updated_at = NOW()
FROM auth.users au
WHERE au.email = 'mindostech@gmail.com'
AND (
    user_profiles.nombre = 'Admin' 
    OR user_profiles.apellido = 'Master'
    OR user_profiles.id = '9d7b6b96-ae99-4eab-b336-14dae92f6858'
);

-- ========================================
-- 3. CREAR PERFIL SI NO EXISTE
-- ========================================

-- Insertar perfil para mindostech@gmail.com si no existe
INSERT INTO user_profiles (
    user_id,
    nombre,
    apellido,
    rol,
    activo,
    created_at,
    updated_at
) 
SELECT 
    au.id,
    'Admin',
    'Master',
    'adminadmin',
    true,
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'mindostech@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = au.id
);

-- ========================================
-- 4. VERIFICACIÓN FINAL
-- ========================================

-- Verificar el perfil específico
SELECT 
    'Perfil después de reparación:' as info,
    up.id,
    up.user_id,
    up.nombre,
    up.apellido,
    up.rol,
    up.activo,
    au.email as auth_email,
    au.created_at as auth_created
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'mindostech@gmail.com';

-- Verificación general
SELECT 
    'Verificación final' as status,
    COUNT(*) as total_perfiles,
    COUNT(CASE WHEN au.id IS NOT NULL THEN 1 END) as correctamente_vinculados,
    COUNT(CASE WHEN au.id IS NULL THEN 1 END) = 0 as todo_ok
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id;
