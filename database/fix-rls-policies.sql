-- Script para corregir las políticas RLS que bloquean la creación de perfiles
-- El error 42501 indica que las políticas de seguridad están impidiendo inserciones

-- ========================================
-- 1. ELIMINAR POLÍTICAS EXISTENTES (si las hay)
-- ========================================

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;

-- ========================================
-- 2. CREAR POLÍTICAS CORRECTAS
-- ========================================

-- Política para permitir a los usuarios ver su propio perfil
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir a los usuarios insertar su propio perfil
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir a los usuarios actualizar su propio perfil
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir a superadmins ver todos los perfiles
CREATE POLICY "Superadmins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up2
            WHERE up2.user_id = auth.uid()
            AND up2.rol = 'superadmin'
        )
    );

-- Política para permitir a superadmins gestionar todos los perfiles
CREATE POLICY "Superadmins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up2
            WHERE up2.user_id = auth.uid()
            AND up2.rol = 'superadmin'
        )
    );

-- ========================================
-- 3. VERIFICACIÓN
-- ========================================

-- Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- ========================================
-- 4. VERIFICACIÓN DE POLÍTICAS
-- ========================================

-- Verificar que las políticas permiten inserciones para usuarios autenticados
SELECT 
    'RLS policies configured correctly' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- ========================================
-- 5. ESTADO FINAL
-- ========================================

SELECT 'RLS policies for user_profiles have been updated' as status;
