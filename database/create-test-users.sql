-- ========================================
-- SCRIPT PARA CREAR USUARIOS DE PRUEBA
-- LigaMaster SaaS - Usuarios con diferentes roles
-- ========================================

-- NOTA: Ejecutar después de haber ejecutado migrate-database.sql

-- ========================================
-- 1. CREAR USUARIOS EN auth.users (si no existen)
-- ========================================

-- Usuario AdminAdmin (mindostech@gmail.com)
-- Este usuario ya debería existir, pero lo incluimos por seguridad
-- Nota: En Supabase, la tabla auth.users tiene la estructura estándar de PostgreSQL
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    phone,
    phone_confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'mindostech@gmail.com',
    NOW(),
    NULL,
    NULL,
    NOW(),
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Usuario Administrador de Liga
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    phone,
    phone_confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    raw_app_meta_data
) VALUES (
    gen_random_uuid(),
    'admin.liga@ejemplo.com',
    NOW(),
    NULL,
    NULL,
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"name":"Carlos Rodríguez","role":"admin_liga"}',
    '{"provider":"email","providers":["email"]}'
) ON CONFLICT DO NOTHING;

-- Usuario Capitán de Equipo
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    phone,
    phone_confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    raw_app_meta_data
) VALUES (
    gen_random_uuid(),
    'capitan.equipo@ejemplo.com',
    NOW(),
    '+525551234567',
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"name":"Martín Gómez","role":"capitan_equipo"}',
    '{"provider":"email","providers":["email"]}'
) ON CONFLICT DO NOTHING;

-- Usuario Jugador normal
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    phone,
    phone_confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    raw_app_meta_data
) VALUES (
    gen_random_uuid(),
    'jugador@ejemplo.com',
    NOW(),
    '+525559876543',
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"name":"Ana López","role":"usuario"}',
    '{"provider":"email","providers":["email"]}'
) ON CONFLICT DO NOTHING;

-- ========================================
-- 2. CREAR PERFILES EN user_profiles
-- ========================================

-- AdminAdmin - Acceso total al sistema
INSERT INTO user_profiles (
    user_id,
    nombre,
    apellido,
    telefono,
    rol,
    liga_id,
    equipo_id,
    es_capitan_equipo,
    activo,
    created_at,
    updated_at
) 
SELECT 
    u.id,
    'Admin',
    'Master',
    '+525551111111',
    'adminadmin',
    NULL,
    NULL,
    false,
    true,
    NOW(),
    NOW()
FROM auth.users u 
WHERE u.email = 'mindostech@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
    rol = EXCLUDED.rol,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- Administrador de Liga - Gestiona su liga
INSERT INTO user_profiles (
    user_id,
    nombre,
    apellido,
    telefono,
    rol,
    liga_id,
    equipo_id,
    es_capitan_equipo,
    activo,
    created_at,
    updated_at
) 
SELECT 
    u.id,
    'Carlos',
    'Rodríguez',
    '+525552222222',
    'admin_liga',
    l.id,
    NULL,
    false,
    true,
    NOW(),
    NOW()
FROM auth.users u, ligas l 
WHERE u.email = 'admin.liga@ejemplo.com' 
AND l.nombre_liga = 'Liga de Ejemplo'
ON CONFLICT (user_id) DO UPDATE SET 
    rol = EXCLUDED.rol,
    liga_id = EXCLUDED.liga_id,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- Capitán de Equipo - Gestiona su equipo
INSERT INTO user_profiles (
    user_id,
    nombre,
    apellido,
    telefono,
    rol,
    liga_id,
    equipo_id,
    es_capitan_equipo,
    activo,
    created_at,
    updated_at
) 
SELECT 
    u.id,
    'Martín',
    'Gómez',
    '+525553333333',
    'capitan_equipo',
    l.id,
    e.id,
    true,
    true,
    NOW(),
    NOW()
FROM auth.users u, ligas l, equipos e 
WHERE u.email = 'capitan.equipo@ejemplo.com' 
AND l.nombre_liga = 'Liga de Ejemplo'
AND e.nombre = 'Tigres FC'
ON CONFLICT (user_id) DO UPDATE SET 
    rol = EXCLUDED.rol,
    liga_id = EXCLUDED.liga_id,
    equipo_id = EXCLUDED.equipo_id,
    es_capitan_equipo = EXCLUDED.es_capitan_equipo,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- Usuario Normal - Solo puede ver información pública
INSERT INTO user_profiles (
    user_id,
    nombre,
    apellido,
    telefono,
    rol,
    liga_id,
    equipo_id,
    es_capitan_equipo,
    activo,
    created_at,
    updated_at
) 
SELECT 
    u.id,
    'Ana',
    'López',
    '+525554444444',
    'usuario',
    l.id,
    e.id,
    false,
    true,
    NOW(),
    NOW()
FROM auth.users u, ligas l, equipos e 
WHERE u.email = 'jugador@ejemplo.com' 
AND l.nombre_liga = 'Liga de Ejemplo'
AND e.nombre = 'Leones FC'
ON CONFLICT (user_id) DO UPDATE SET 
    rol = EXCLUDED.rol,
    liga_id = EXCLUDED.liga_id,
    equipo_id = EXCLUDED.equipo_id,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- ========================================
-- 3. CREAR LIGA Y EQUIPOS DE EJEMPLO (si no existen)
-- ========================================

-- Crear liga de ejemplo
INSERT INTO ligas (
    id,
    nombre_liga,
    slug,
    descripcion,
    owner_id,
    estatus_pago,
    plan,
    fecha_registro,
    fecha_vencimiento,
    activa,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Liga de Ejemplo',
    'liga-ejemplo',
    'Liga de prueba para demostrar el funcionamiento del sistema',
    (SELECT id FROM auth.users WHERE email = 'admin.liga@ejemplo.com' LIMIT 1),
    true,
    'Oro',
    NOW(),
    NOW() + INTERVAL '1 year',
    true,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Crear equipos de ejemplo
INSERT INTO equipos (
    liga_id,
    nombre,
    logo_url,
    color_primario,
    color_secundario,
    capitan_id,
    activo,
    created_at,
    updated_at
) 
SELECT 
    l.id,
    'Tigres FC',
    'https://via.placeholder.com/150x150/FF6B00/FFFFFF?text=TIG',
    '#FF6B00',
    '#FFFFFF',
    (SELECT id FROM auth.users WHERE email = 'capitan.equipo@ejemplo.com' LIMIT 1),
    true,
    NOW(),
    NOW()
FROM ligas l 
WHERE l.nombre_liga = 'Liga de Ejemplo'
ON CONFLICT (liga_id, nombre) DO NOTHING;

INSERT INTO equipos (
    liga_id,
    nombre,
    logo_url,
    color_primario,
    color_secundario,
    capitan_id,
    activo,
    created_at,
    updated_at
) 
SELECT 
    l.id,
    'Leones FC',
    'https://via.placeholder.com/150x150/0066CC/FFFFFF?text=LEO',
    '#0066CC',
    '#FFFFFF',
    NULL,
    true,
    NOW(),
    NOW()
FROM ligas l 
WHERE l.nombre_liga = 'Liga de Ejemplo'
ON CONFLICT (liga_id, nombre) DO NOTHING;

-- ========================================
-- 4. CREAR JUGADORES DE EJEMPLO
-- ========================================

-- Jugadores para Tigres FC
INSERT INTO jugadores (
    equipo_id,
    user_profile_id,
    nombre,
    apellido,
    email,
    telefono,
    fecha_nacimiento,
    numero_camiseta,
    posicion,
    activo,
    es_capitan,
    fecha_registro,
    created_at,
    updated_at
) 
SELECT 
    e.id,
    up.id,
    'Martín',
    'Gómez',
    'capitan.equipo@ejemplo.com',
    '+525553333333',
    '1990-05-15',
    10,
    'medio',
    true,
    true,
    NOW(),
    NOW(),
    NOW()
FROM equipos e, user_profiles up, auth.users u
WHERE e.nombre = 'Tigres FC'
AND up.user_id = u.id
AND u.email = 'capitan.equipo@ejemplo.com'
ON CONFLICT (user_profile_id) DO NOTHING;

INSERT INTO jugadores (
    equipo_id,
    nombre,
    apellido,
    email,
    telefono,
    fecha_nacimiento,
    numero_camiseta,
    posicion,
    activo,
    es_capitan,
    fecha_registro,
    created_at,
    updated_at
) 
SELECT 
    e.id,
    'Juan',
    'Pérez',
    'juan.perez@ejemplo.com',
    '+525553333334',
    '1992-08-20',
    7,
    'defensa',
    true,
    false,
    NOW(),
    NOW(),
    NOW()
FROM equipos e 
WHERE e.nombre = 'Tigres FC'
ON CONFLICT (equipo_id, email) DO NOTHING;

INSERT INTO jugadores (
    equipo_id,
    nombre,
    apellido,
    email,
    telefono,
    fecha_nacimiento,
    numero_camiseta,
    posicion,
    activo,
    es_capitan,
    fecha_registro,
    created_at,
    updated_at
) 
SELECT 
    e.id,
    'Luis',
    'Hernández',
    'luis.hernandez@ejemplo.com',
    '+525553333335',
    '1988-12-10',
    11,
    'delantero',
    true,
    false,
    NOW(),
    NOW(),
    NOW()
FROM equipos e 
WHERE e.nombre = 'Tigres FC'
ON CONFLICT (equipo_id, email) DO NOTHING;

-- Jugadores para Leones FC
INSERT INTO jugadores (
    equipo_id,
    user_profile_id,
    nombre,
    apellido,
    email,
    telefono,
    fecha_nacimiento,
    numero_camiseta,
    posicion,
    activo,
    es_capitan,
    fecha_registro,
    created_at,
    updated_at
) 
SELECT 
    e.id,
    up.id,
    'Ana',
    'López',
    'jugador@ejemplo.com',
    '+525554444444',
    '1995-03-25',
    9,
    'portero',
    true,
    false,
    NOW(),
    NOW(),
    NOW()
FROM equipos e, user_profiles up, auth.users u
WHERE e.nombre = 'Leones FC'
AND up.user_id = u.id
AND u.email = 'jugador@ejemplo.com'
ON CONFLICT (user_profile_id) DO NOTHING;

INSERT INTO jugadores (
    equipo_id,
    nombre,
    apellido,
    email,
    telefono,
    fecha_nacimiento,
    numero_camiseta,
    posicion,
    activo,
    es_capitan,
    fecha_registro,
    created_at,
    updated_at
) 
SELECT 
    e.id,
    'María',
    'García',
    'maria.garcia@ejemplo.com',
    '+525554444445',
    '1993-07-18',
    5,
    'defensa',
    true,
    false,
    NOW(),
    NOW(),
    NOW()
FROM equipos e 
WHERE e.nombre = 'Leones FC'
ON CONFLICT (equipo_id, email) DO NOTHING;

-- ========================================
-- 5. CREAR CANCHAS DE EJEMPLO
-- ========================================

INSERT INTO canchas (
    liga_id,
    nombre,
    direccion,
    tipo,
    superficie,
    capacidad_espectadores,
    tiene_iluminacion,
    tiene_vestuarios,
    precio_hora,
    activa,
    created_at,
    updated_at
) 
SELECT 
    l.id,
    'Cancha Principal',
    'Av. Principal #123, Ciudad de Ejemplo',
    'futbol',
    'sintetico',
    500,
    true,
    true,
    100.00,
    true,
    NOW(),
    NOW()
FROM ligas l 
WHERE l.nombre_liga = 'Liga de Ejemplo'
ON CONFLICT (liga_id, nombre) DO NOTHING;

INSERT INTO canchas (
    liga_id,
    nombre,
    direccion,
    tipo,
    superficie,
    capacidad_espectadores,
    tiene_iluminacion,
    tiene_vestuarios,
    precio_hora,
    activa,
    created_at,
    updated_at
) 
SELECT 
    l.id,
    'Cancha Secundaria',
    'Calle Secundaria #456, Ciudad de Ejemplo',
    'futbol_7',
    'cemento',
    200,
    false,
    false,
    50.00,
    true,
    NOW(),
    NOW()
FROM ligas l 
WHERE l.nombre_liga = 'Liga de Ejemplo'
ON CONFLICT (liga_id, nombre) DO NOTHING;

-- ========================================
-- 6. VERIFICACIÓN FINAL
-- ========================================

-- Mostrar usuarios creados
SELECT 
    u.email as email_auth,
    up.nombre,
    up.apellido,
    up.rol,
    up.activo,
    CASE 
        WHEN up.rol = 'adminadmin' THEN 'Acceso total al sistema'
        WHEN up.rol = 'admin_liga' THEN 'Administrador de liga'
        WHEN up.rol = 'capitan_equipo' THEN 'Capitán de equipo'
        WHEN up.rol = 'usuario' THEN 'Usuario normal'
    END as permisos
FROM auth.users u
JOIN user_profiles up ON u.id = up.user_id
WHERE u.email IN (
    'mindostech@gmail.com',
    'admin.liga@ejemplo.com', 
    'capitan.equipo@ejemplo.com',
    'jugador@ejemplo.com'
)
ORDER BY up.rol;

-- Mostrar equipos y jugadores
SELECT 
    l.nombre_liga,
    e.nombre as equipo,
    COUNT(j.id) as total_jugadores,
    j.nombre as nombre_capitan
FROM ligas l
JOIN equipos e ON l.id = e.liga_id
LEFT JOIN jugadores j ON e.id = j.equipo_id AND j.es_capitan = true
WHERE l.nombre_liga = 'Liga de Ejemplo'
GROUP BY l.nombre_liga, e.nombre, j.nombre
ORDER BY e.nombre;

-- ========================================
-- INSTRUCCIONES DE USO
-- ========================================

/*
PARA PROBAR EL SISTEMA:

1. EJECUTAR EN ORDEN:
   - Primero: migrate-database.sql
   - Segundo: create-test-users.sql

2. USUARIOS CREADOS:
   - AdminAdmin: mindostech@gmail.com (acceso total)
   - Admin Liga: admin.liga@ejemplo.com (gestiona su liga)
   - Capitán: capitan.equipo@ejemplo.com (gestiona Tigres FC)
   - Jugador: jugador@ejemplo.com (pertenece a Leones FC)

3. CONTRASEÑAS:
   - Las contraseñas se establecen en el registro o desde el panel de Supabase
   - Puedes establecer contraseñas temporales desde Authentication > Users

4. ACCESO POR ROL:
   - /admin-admin → Solo mindostech@gmail.com
   - /equipos → Admin liga y capitanes
   - /canchas → Admin liga
   - /programacion-partidos → Admin liga
   - /roles-juego → Público (sin login requerido)

5. FLUJO DE PRUEBA:
   a) Iniciar sesión como admin.liga@ejemplo.com
   b) Crear/configurar temporada
   c) Generar partidos con Round Robin
   d) Iniciar sesión como capitan.equipo@ejemplo.com
   e) Gestionar equipo y jugadores
   f) Ver roles de juego públicos sin login

*/
