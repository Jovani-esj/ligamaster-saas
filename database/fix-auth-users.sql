-- ========================================
-- SCRIPT PARA CORREGIR auth.users (OPCIÓN A)
-- Agregar restricción UNIQUE a la columna email
-- ========================================

-- Agregar restricción única a la columna email en auth.users
ALTER TABLE auth.users 
ADD CONSTRAINT auth_users_email_unique UNIQUE (email);

-- Ahora puedes ejecutar create-test-users-simple.sql sin errores
