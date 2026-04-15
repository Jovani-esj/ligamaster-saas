-- Script para debuguear los usuarios en la base de datos

-- ========================================
-- 1. VERIFICAR SI LA TABLA EXISTE
-- ========================================

SELECT 
    'Tabla usuarios_simple existe:' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'usuarios_simple';

-- ========================================
-- 2. VERIFICAR USUARIOS CREADOS
-- ========================================

SELECT 
    'Usuarios en tabla usuarios_simple:' as info,
    id,
    email,
    password,
    nombre,
    apellido,
    rol,
    activo,
    created_at
FROM usuarios_simple
ORDER BY created_at;

-- ========================================
-- 3. VERIFICAR USUARIO ESPECÍFICO
-- ========================================

SELECT 
    'Buscando mindostech@gmail.com:' as info,
    id,
    email,
    password,
    nombre,
    apellido,
    rol,
    activo
FROM usuarios_simple
WHERE email = 'mindostech@gmail.com';

-- ========================================
-- 4. VERIFICAR CONTRASEÑA
-- ========================================

SELECT 
    'Verificación de contraseña:' as info,
    email,
    password,
    LENGTH(password) as password_length,
    password = '123456' as password_match
FROM usuarios_simple
WHERE email = 'mindostech@gmail.com';

-- ========================================
-- 5. CONTAR USUARIOS
-- ========================================

SELECT 
    'Total de usuarios:' as info,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN rol = 'adminadmin' THEN 1 END) as adminadmin_count,
    COUNT(CASE WHEN rol = 'superadmin' THEN 1 END) as superadmin_count
FROM usuarios_simple;
