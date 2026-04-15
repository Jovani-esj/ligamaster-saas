-- Fix RLS policies for user_profiles table
-- Ejecutar este script en el editor SQL de Supabase

-- 1. Eliminar políticas existentes que causan problemas
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Solo superadmins pueden insertar perfiles" ON user_profiles;

-- 2. Crear nuevas políticas corregidas

-- Política para que los usuarios puedan ver su propio perfil
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar su propio perfil (REGISTRO)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar su propio perfil
CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Política para que los superadmins puedan hacer todo
CREATE POLICY "Superadmins can manage all profiles" ON user_profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'superadmin');

-- 3. Verificar que las políticas estén activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 4. Opcional: Insertar un usuario de prueba si no existe
-- (Descomentar si necesitas datos de prueba)
/*
INSERT INTO user_profiles (user_id, nombre, apellido, rol, activo)
SELECT 
  id,
  'Test',
  'User',
  'usuario',
  true
FROM auth.users 
WHERE email = 'test@example.com'
AND NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.users.id
);
*/
