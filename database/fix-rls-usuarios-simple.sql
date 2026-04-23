-- Script para deshabilitar RLS en usuarios_simple temporalmente
-- Esto permitirá que el API acceda a los datos

-- ========================================
-- 1. DESHABILITAR RLS EN usuarios_simple
-- ========================================

-- Deshabilitar RLS completamente para usuarios_simple
ALTER TABLE usuarios_simple DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. ELIMINAR POLÍTICAS EXISTENTES
-- ========================================

-- Eliminar todas las políticas de usuarios_simple
DROP POLICY IF EXISTS "Users can view their own simple user" ON usuarios_simple;
DROP POLICY IF EXISTS "Users can insert simple users" ON usuarios_simple;
DROP POLICY IF EXISTS "Users can update simple users" ON usuarios_simple;
DROP POLICY IF EXISTS "Enable read access for all users" ON usuarios_simple;
DROP POLICY IF EXISTS "Enable insert for all users" ON usuarios_simple;
DROP POLICY IF EXISTS "Enable update for own user" ON usuarios_simple;

-- ========================================
-- 3. VERIFICAR ESTADO
-- ========================================

-- Verificar que RLS esté deshabilitado
SELECT 
    'RLS Status after fix:' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'usuarios_simple';

-- ========================================
-- 4. PROBAR ACCESO A DATOS
-- ========================================

-- Probar query que hace el API
SELECT 
    'API Access Test:' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email = 'mindostech@gmail.com' THEN 1 END) as mindostech_exists
FROM usuarios_simple;

-- ========================================
-- 5. MOSTRAR PRIMEROS 5 USUARIOS
-- ========================================

SELECT 
    'First 5 users:' as info,
    id,
    email,
    nombre,
    rol,
    activo,
    created_at
FROM usuarios_simple
ORDER BY created_at
LIMIT 5;
