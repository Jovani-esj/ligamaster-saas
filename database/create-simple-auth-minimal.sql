-- Script mínimo para crear solo la tabla usuarios_simple
-- Sin ninguna referencia a user_profiles

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
-- 2. INSERTAR USUARIOS DE PRUEBA
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
-- 3. VERIFICACIÓN
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

SELECT 'Sistema de autenticación simple creado correctamente' as status;
