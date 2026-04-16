-- Fix RLS policies for user_profiles to allow admin_liga to view capitanes
-- Creado: 2024-04-16

-- Asegurarse de que RLS esté habilitado
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
    ON user_profiles
    FOR SELECT
    USING (user_id = auth.uid());

-- Política: Los admins de liga pueden ver perfiles de su liga
DROP POLICY IF EXISTS "Admins de liga pueden ver perfiles de su liga" ON user_profiles;
CREATE POLICY "Admins de liga pueden ver perfiles de su liga"
    ON user_profiles
    FOR SELECT
    USING (
        liga_id IS NOT NULL 
        AND liga_id IN (
            SELECT id FROM ligas WHERE owner_id = auth.uid()
        )
    );

-- Política: Los usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
    ON user_profiles
    FOR UPDATE
    USING (user_id = auth.uid());

-- Política: Permitir inserts durante registro
DROP POLICY IF EXISTS "Allow insert during signup" ON user_profiles;
CREATE POLICY "Allow insert during signup"
    ON user_profiles
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Política: Superadmins pueden ver todos los perfiles
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON user_profiles;
CREATE POLICY "Superadmins can view all profiles"
    ON user_profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.rol IN ('superadmin', 'adminadmin')
        )
    );

-- Política: Los capitanes pueden ver perfiles de su propio equipo
DROP POLICY IF EXISTS "Capitanes pueden ver perfiles de su equipo" ON user_profiles;
CREATE POLICY "Capitanes pueden ver perfiles de su equipo"
    ON user_profiles
    FOR SELECT
    USING (
        equipo_id IS NOT NULL 
        AND equipo_id IN (
            SELECT equipo_id FROM user_profiles WHERE user_id = auth.uid() AND es_capitan_equipo = true
        )
    );

COMMENT ON TABLE user_profiles IS 'Perfiles de usuarios con políticas RLS actualizadas para acceso de admins y capitanes';
