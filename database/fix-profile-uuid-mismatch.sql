-- Fix UUID mismatch in user_profiles table
-- This script fixes the issue where user_id doesn't match the actual auth.users.id

-- First, let's see the current state
SELECT 
    up.id,
    up.user_id,
    up.nombre,
    up.apellido,
    up.email,
    au.id as auth_user_id,
    au.email as auth_email
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at;

-- Fix profiles where user_id is NULL or doesn't match auth.users.id
-- This updates user_id to match the corresponding auth.users.id based on email

UPDATE user_profiles 
SET user_id = auth.users.id
FROM auth.users
WHERE auth.users.email = user_profiles.email 
AND (user_profiles.user_id IS NULL OR user_profiles.user_id != auth.users.id);

-- For profiles that don't have email match, you might need to manually update them
-- Example: Update specific profile with known email
UPDATE user_profiles 
SET user_id = auth.users.id
FROM auth.users
WHERE auth.users.email = 'mindostech@gmail.com' 
AND user_profiles.email = 'mindostech@gmail.com';

-- Verify the fix
SELECT 
    up.id,
    up.user_id,
    up.nombre,
    up.apellido,
    up.email,
    au.id as auth_user_id,
    au.email as auth_email,
    CASE 
        WHEN up.user_id = au.id THEN 'MATCH'
        ELSE 'MISMATCH'
    END as status
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
ORDER BY up.created_at;
