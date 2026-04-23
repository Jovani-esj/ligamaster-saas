-- Script para crear un sistema de autenticación simple para pruebas
-- Guarda usuarios y contraseñas en texto plano (NO USAR EN PRODUCCIÓN)

-- ========================================
-- 1. CREAR TABLA DE USUARIOS SIMPLE
-- ========================================

-- Eliminar tabla si existe
DROP TABLE IF EXISTS usuarios_simple CASCADE;

-- Crear tabla de usuarios simple
CREATE TABLE usuarios_simple (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    password text NOT NULL, -- Contraseña en texto plano (solo para pruebas)
    nombre text NOT NULL,
    apellido text,
    rol text NOT NULL DEFAULT 'usuario' CHECK (rol IN ('superadmin', 'adminadmin', 'admin_liga', 'capitan_equipo', 'usuario')),
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT usuarios_simple_pkey PRIMARY KEY (id)
);

-- ========================================
-- 2. CREAR ÍNDICES
-- ========================================

CREATE INDEX idx_usuarios_simple_email ON usuarios_simple(email);
CREATE INDEX idx_usuarios_simple_rol ON usuarios_simple(rol);
CREATE INDEX idx_usuarios_simple_activo ON usuarios_simple(activo);

-- ========================================
-- 3. INSERTAR USUARIOS DE PRUEBA
-- ========================================

-- SuperAdmin
INSERT INTO usuarios_simple (email, password, nombre, apellido, rol) VALUES
('superadmin@ligamaster.com', '123456', 'Super', 'Admin', 'superadmin');

-- AdminAdmin (mindostech@gmail.com)
INSERT INTO usuarios_simple (email, password, nombre, apellido, rol) VALUES
('mindostech@gmail.com', '123456', 'Admin', 'Master', 'adminadmin');

-- Admin Liga
INSERT INTO usuarios_simple (email, password, nombre, apellido, rol) VALUES
('admin.liga@ejemplo.com', '123456', 'Admin', 'Liga', 'admin_liga');

-- Capitán Equipo
INSERT INTO usuarios_simple (email, password, nombre, apellido, rol) VALUES
('capitan.equipo@ejemplo.com', '123456', 'Capitan', 'Equipo', 'capitan_equipo');

-- Usuario normal
INSERT INTO usuarios_simple (email, password, nombre, apellido, rol) VALUES
('usuario@ejemplo.com', '123456', 'Usuario', 'Normal', 'usuario');

-- ========================================
-- 4. NOTA SOBRE PERFILES
-- ========================================

-- Los perfiles se crearán automáticamente cuando los usuarios inicien sesión
-- a través del sistema de autenticación simple
-- Los user_id de usuarios_simple no existen en auth.users, así que no podemos
-- crear perfiles directamente desde aquí

-- ========================================
-- 5. VERIFICACIÓN
-- ========================================

-- Mostrar usuarios creados
SELECT 
    'Usuarios simples creados:' as info,
    us.email,
    us.nombre,
    us.apellido,
    us.rol,
    us.activo,
    us.created_at
FROM usuarios_simple us
ORDER BY us.rol, us.email;

-- ========================================
-- 6. POLÍTICAS RLS PARA LA NUEVA TABLA
-- ========================================

-- Habilitar RLS
ALTER TABLE usuarios_simple ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios_simple
DROP POLICY IF EXISTS "Users can view their own simple user" ON usuarios_simple;
DROP POLICY IF EXISTS "Users can insert simple users" ON usuarios_simple;
DROP POLICY IF EXISTS "Users can update simple users" ON usuarios_simple;

CREATE POLICY "Users can view their own simple user" ON usuarios_simple
    FOR SELECT USING (email = current_setting('app.current_email', true));

CREATE POLICY "Users can insert simple users" ON usuarios_simple
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update simple users" ON usuarios_simple
    FOR UPDATE USING (email = current_setting('app.current_email', true));

SELECT 'Sistema de autenticación simple creado correctamente' as status;
