-- ========================================
-- SCRIPT MANUAL PARA INSERTAR USUARIOS Y DATOS DE PRUEBA
-- LigaMaster SaaS - Inserción directa sin conflictos
-- ========================================

-- NOTA: Ejecutar después de recreate-all-tables.sql y fix-authusers.sql

-- ========================================
-- 1. INSERTAR USUARIOS EN auth.users
-- ========================================

-- Usuario AdminAdmin (mindostech@gmail.com)
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',  -- UUID fijo para mindostech@gmail.com
    'mindostech@gmail.com',
    NOW(),
    NOW(),
    NOW()
);

-- Usuario Administrador de Liga (admin.liga@ejemplo.com)
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',  -- UUID fijo para admin.liga@ejemplo.com
    'admin.liga@ejemplo.com',
    NOW(),
    NOW(),
    NOW()
);

-- Usuario Capitán de Equipo (capitan.equipo@ejemplo.com)
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',  -- UUID fijo para capitan.equipo@ejemplo.com
    'capitan.equipo@ejemplo.com',
    NOW(),
    NOW(),
    NOW()
);

-- Usuario Jugador Normal (jugador@ejemplo.com)
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',  -- UUID fijo para jugador@ejemplo.com
    'jugador@ejemplo.com',
    NOW(),
    NOW(),
    NOW()
);

-- ========================================
-- 2. INSERTAR PERFILES EN user_profiles
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
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',  -- UUID de mindostech@gmail.com
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
);

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
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',  -- UUID de admin.liga@ejemplo.com
    'Carlos',
    'Rodríguez',
    '+525552222222',
    'admin_liga',
    '550e8400-e29b-41d4-a716-446655440100',  -- UUID de la liga (se creará abajo)
    NULL,
    false,
    true,
    NOW(),
    NOW()
);

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
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',  -- UUID de capitan.equipo@ejemplo.com
    'Martín',
    'Gómez',
    '+525553333333',
    'capitan_equipo',
    '550e8400-e29b-41d4-a716-446655440100',  -- UUID de la liga
    '550e8400-e29b-41d4-a716-446655440101',  -- UUID de Tigres FC (se creará abajo)
    true,
    true,
    NOW(),
    NOW()
);

-- Jugador Normal - Pertenece a equipo
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
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',  -- UUID de jugador@ejemplo.com
    'Ana',
    'López',
    '+525554444444',
    'usuario',
    '550e8400-e29b-41d4-a716-446655440100',  -- UUID de la liga
    '550e8400-e29b-41d4-a716-446655440102',  -- UUID de Leones FC (se creará abajo)
    false,
    true,
    NOW(),
    NOW()
);

-- ========================================
-- 3. INSERTAR LIGA DE EJEMPLO
-- ========================================

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
    '550e8400-e29b-41d4-a716-446655440100',  -- UUID para la liga
    'Liga de Ejemplo',
    'liga-ejemplo',
    'Liga de prueba para demostrar el funcionamiento del sistema',
    '550e8400-e29b-41d4-a716-446655440001',  -- UUID de admin.liga@ejemplo.com
    true,
    'Oro',
    NOW(),
    NOW() + INTERVAL '1 year',
    true,
    NOW(),
    NOW()
);

-- ========================================
-- 4. INSERTAR EQUIPOS DE EJEMPLO
-- ========================================

-- Tigres FC
INSERT INTO equipos (
    id,
    liga_id,
    nombre,
    logo_url,
    color_primario,
    color_secundario,
    capitan_id,
    activo,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440101',  -- UUID para Tigres FC
    '550e8400-e29b-41d4-a716-446655440100',  -- UUID de la liga
    'Tigres FC',
    'https://via.placeholder.com/150x150/FF6B00/FFFFFF?text=TIG',
    '#FF6B00',
    '#FFFFFF',
    '550e8400-e29b-41d4-a716-446655440002',  -- UUID de capitan.equipo@ejemplo.com
    true,
    NOW(),
    NOW()
);

-- Leones FC
INSERT INTO equipos (
    id,
    liga_id,
    nombre,
    logo_url,
    color_primario,
    color_secundario,
    capitan_id,
    activo,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440102',  -- UUID para Leones FC
    '550e8400-e29b-41d4-a716-446655440100',  -- UUID de la liga
    'Leones FC',
    'https://via.placeholder.com/150x150/0066CC/FFFFFF?text=LEO',
    '#0066CC',
    '#FFFFFF',
    NULL,
    true,
    NOW(),
    NOW()
);

-- ========================================
-- 5. INSERTAR JUGADORES DE EJEMPLO
-- ========================================

-- Jugadores para Tigres FC
-- Capitán (ya existe en user_profiles)
INSERT INTO jugadores (
    id,
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
) VALUES (
    '550e8400-e29b-41d4-a716-446655440103',  -- UUID para Martín Gómez
    '550e8400-e29b-41d4-a716-446655440101',  -- UUID de Tigres FC
    '550e8400-e29b-41d4-a716-446655440002',  -- UUID de capitan.equipo@ejemplo.com
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
);

-- Jugador adicional para Tigres FC
INSERT INTO jugadores (
    id,
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
) VALUES (
    '550e8400-e29b-41d4-a716-446655440104',  -- UUID para Juan Pérez
    '550e8400-e29b-41d4-a716-446655440101',  -- UUID de Tigres FC
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
);

-- Jugador adicional para Tigres FC
INSERT INTO jugadores (
    id,
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
) VALUES (
    '550e8400-e29b-41d4-a716-446655440105',  -- UUID para Luis Hernández
    '550e8400-e29b-41d4-a716-446655440101',  -- UUID de Tigres FC
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
);

-- Jugadores para Leones FC
-- Jugadora (ya existe en user_profiles)
INSERT INTO jugadores (
    id,
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
) VALUES (
    '550e8400-e29b-41d4-a716-446655440106',  -- UUID para Ana López
    '550e8400-e29b-41d4-a716-446655440102',  -- UUID de Leones FC
    '550e8400-e29b-41d4-a716-446655440003',  -- UUID de jugador@ejemplo.com
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
);

-- Jugadora adicional para Leones FC
INSERT INTO jugadores (
    id,
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
) VALUES (
    '550e8400-e29b-41d4-a716-446655440107',  -- UUID para María García
    '550e8400-e29b-41d4-a716-446655440102',  -- UUID de Leones FC
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
);

-- ========================================
-- 6. INSERTAR CANCHAS DE EJEMPLO
-- ========================================

-- Cancha Principal
INSERT INTO canchas (
    id,
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
) VALUES (
    '550e8400-e29b-41d4-a716-446655440108',  -- UUID para Cancha Principal
    '550e8400-e29b-41d4-a716-446655440100',  -- UUID de la liga
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
);

-- Cancha Secundaria
INSERT INTO canchas (
    id,
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
) VALUES (
    '550e8400-e29b-41d4-a716-446655440109',  -- UUID para Cancha Secundaria
    '550e8400-e29b-41d4-a716-446655440100',  -- UUID de la liga
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
);

-- ========================================
-- 7. VERIFICACIÓN FINAL
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
USUARIOS CREADOS:
- Email: mindostech@gmail.com | Rol: adminadmin | Acceso: Total al sistema
- Email: admin.liga@ejemplo.com | Rol: admin_liga | Acceso: Administrador de liga
- Email: capitan.equipo@ejemplo.com | Rol: capitan_equipo | Acceso: Capitán de equipo
- Email: jugador@ejemplo.com | Rol: usuario | Acceso: Usuario normal

CONTRASEÑAS:
- Establecer manualmente en Supabase Authentication → Users
- Se recomienda usar contraseñas temporales: 123456

DATOS DE PRUEBA:
- Liga: "Liga de Ejemplo"
- Equipos: "Tigres FC" y "Leones FC"
- Jugadores: 6 distribuidos (3 por equipo)
- Canchas: 2 disponibles

ACCESO AL SISTEMA:
1. Ejecutar en orden: recreate-all-tables.sql → fix-authusers.sql → insert-usuarios-manual.sql
2. Establecer contraseñas en Supabase
3. Iniciar sesión y probar cada rol
4. Acceder a /admin-admin con mindostech@gmail.com
5. Acceder a /equipos con admin.liga@ejemplo.com
6. Acceder a /equipos con capitan.equipo@ejemplo.com
7. Acceder a /roles-juego (público, sin login)

*/
