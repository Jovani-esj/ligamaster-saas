-- Complete fix for profile issues in LigaMaster SaaS
-- This script addresses the "Perfil no encontrado" error and UUID mismatches
-- Updated to match the actual table structure from the creation script

-- ========================================
-- 1. DIAGNOSTIC QUERIES
-- ========================================

-- Check current state of user_profiles vs auth.users
SELECT 
    'Current user_profiles state' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_id,
    COUNT(CASE WHEN user_id IN (SELECT id FROM auth.users) THEN 1 END) as matching_auth,
    COUNT(CASE WHEN user_id NOT IN (SELECT id FROM auth.users) OR user_id IS NULL THEN 1 END) as mismatched
FROM user_profiles;

-- Show specific problematic profiles
SELECT 
    up.id,
    up.user_id,
    up.nombre,
    up.apellido,
    up.rol,
    up.activo,
    CASE 
        WHEN au.id IS NOT NULL THEN 'MATCH'
        WHEN up.user_id IS NULL THEN 'NULL_USER_ID'
        ELSE 'NO_AUTH_MATCH'
    END as status,
    au.email as auth_email
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE up.user_id IS NULL OR au.id IS NULL
ORDER BY up.created_at;

-- ========================================
-- 2. FIX QUERIES
-- ========================================

-- Fix 1: Update profiles where user_id is NULL but we can match by nombre/apellido with auth.users metadata
UPDATE user_profiles 
SET user_id = au.id
FROM auth.users au
WHERE user_profiles.user_id IS NULL 
AND (
    LOWER(user_profiles.nombre) = LOWER(COALESCE(au.raw_user_meta_data->>'nombre', au.raw_user_meta_data->>'name', ''))
    OR LOWER(user_profiles.apellido) = LOWER(COALESCE(au.raw_user_meta_data->>'apellido', ''))
);

-- Fix 2: Update profiles where user_id doesn't match any auth user but we can find match by email in auth.users
UPDATE user_profiles 
SET user_id = au.id
FROM auth.users au
WHERE user_profiles.user_id NOT IN (SELECT id FROM auth.users)
AND LOWER(user_profiles.nombre) = LOWER(COALESCE(au.raw_user_meta_data->>'nombre', au.raw_user_meta_data->>'name', ''));

-- Fix 3: For the specific user mentioned in the error (mindostech@gmail.com)
-- First check if this user exists in auth.users
UPDATE user_profiles 
SET user_id = au.id
FROM auth.users au
WHERE LOWER(au.email) = 'mindostech@gmail.com'
AND (
    LOWER(user_profiles.nombre) = 'admin' 
    OR LOWER(user_profiles.apellido) = 'master'
    OR user_profiles.id = '9d7b6b96-ae99-4eab-b336-14dae92f6858'
);

-- Fix 4: Create missing profiles for auth users that don't have profiles
INSERT INTO user_profiles (user_id, nombre, apellido, rol, activo, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'nombre', au.raw_user_meta_data->>'name', 'Usuario'),
    COALESCE(au.raw_user_meta_data->>'apellido', ''),
    'usuario',
    true,
    NOW(),
    NOW()
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM user_profiles WHERE user_id IS NOT NULL)
AND au.email IS NOT NULL;

-- ========================================
-- 3. VERIFICATION QUERIES
-- ========================================

-- Verify all profiles now have matching auth users
SELECT 
    'Verification after fixes' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN user_id IN (SELECT id FROM auth.users) THEN 1 END) as matching_auth,
    COUNT(CASE WHEN user_id NOT IN (SELECT id FROM auth.users) OR user_id IS NULL THEN 1 END) as still_mismatched
FROM user_profiles;

-- Show the specific user that was having issues
SELECT 
    up.id,
    up.user_id,
    up.nombre,
    up.apellido,
    up.email,
    up.rol,
    au.email as auth_email,
    au.created_at as auth_created
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE LOWER(au.email) = 'mindostech@gmail.com';

-- ========================================
-- 4. ADDITIONAL CLEANUP
-- ========================================

-- Remove duplicate profiles (keep most recent one)
WITH ranked_profiles AS (
    SELECT 
        id,
        user_id,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM user_profiles
    WHERE user_id IS NOT NULL
)
DELETE FROM user_profiles 
WHERE id IN (
    SELECT id FROM ranked_profiles WHERE rn > 1
);

-- ========================================
-- 5. FINAL VERIFICATION
-- ========================================

-- Final check - should show no mismatches
SELECT 
    'Final verification' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN user_id IN (SELECT id FROM auth.users) THEN 1 END) as properly_linked,
    COUNT(CASE WHEN user_id IS NULL OR user_id NOT IN (SELECT id FROM auth.users) THEN 1 END) as broken_profiles
FROM user_profiles;

-- ========================================
-- 6. MANUAL FIX FOR SPECIFIC CASES
-- ========================================

-- If the above fixes don't work, you may need to manually update specific profiles
-- Example for mindostech@gmail.com with known UUID
UPDATE user_profiles 
SET user_id = '9d7b6b96-ae99-4eab-b336-14dae92f6858'
WHERE nombre = 'Admin' AND apellido = 'Master';

-- Alternative: Create profile directly if it doesn't exist
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
) ON CONFLICT (user_id) DO UPDATE SET 
    rol = EXCLUDED.rol,
    activo = EXCLUDED.activo,
    updated_at = NOW();
