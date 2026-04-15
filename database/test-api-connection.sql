-- Script para probar la conexión del API con la base de datos

-- ========================================
-- 1. VERIFICAR PERMISOS DE LA TABLA
-- ========================================

-- Verificar si la tabla tiene RLS habilitado
SELECT 
    'RLS Status:' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'usuarios_simple';

-- ========================================
-- 2. VERIFICAR POLÍTICAS RLS
-- ========================================

SELECT 
    'RLS Policies:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'usuarios_simple';

-- ========================================
-- 3. VERIFICAR USUARIOS CON DETALLES
-- ========================================

SELECT 
    'Usuarios con detalles:' as info,
    id,
    email,
    password,
    nombre,
    apellido,
    rol,
    activo,
    created_at,
    LENGTH(password) as password_length
FROM usuarios_simple
ORDER BY created_at;

-- ========================================
-- 4. PROBAR QUERY EXACTA DEL API
-- ========================================

-- Simular la query exacta que hace el API
SELECT 
    'API Query Simulation:' as info,
    *
FROM usuarios_simple
WHERE email = 'mindostech@gmail.com'
AND activo = true
LIMIT 1;

-- ========================================
-- 5. VERIFICAR VARIABLES DE ENTORNO (si es posible)
-- ========================================

-- Nota: Esta sección puede no funcionar en Supabase SQL Editor
-- pero es útil para debugging

SELECT 
    'Connection Test:' as info,
    current_database(),
    current_schema(),
    current_user,
    session_user;
