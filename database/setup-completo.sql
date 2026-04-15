-- ========================================
-- SCRIPT COMPLETO PARA CONFIGURACIÓN INTEGRAL
-- LigaMaster SaaS - Crear todo en un solo script
-- ========================================

-- NOTA: Este script crea todas las tablas, relaciones y usuarios de prueba
-- Ejecutar en el editor SQL de Supabase

-- ========================================
-- 1. CREAR TABLAS COMPLETAS
-- ========================================

-- Tabla de Ligas
CREATE TABLE ligas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    descripcion text NOT NULL,
    nombre_liga text NOT NULL,
    slug text NOT NULL UNIQUE,
    owner_id uuid,
    estatus_pago boolean DEFAULT false,
    plan text DEFAULT 'Bronce'::text CHECK (plan = ANY (ARRAY['Bronce'::text, 'Plata'::text, 'Oro'::text])),
    fecha_registro timestamp with time zone DEFAULT now(),
    fecha_vencimiento timestamp with time zone,
    activa boolean DEFAULT true,
    CONSTRAINT ligas_pkey PRIMARY KEY (id)
);

-- Tabla de Equipos
CREATE TABLE equipos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    liga_id uuid NOT NULL,
    nombre text NOT NULL,
    logo_url text,
    color_primario VARCHAR(7) DEFAULT '#000000',
    color_secundario VARCHAR(7) DEFAULT '#FFFFFF',
    capitan_id uuid,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT equipos_pkey PRIMARY KEY (id),
    CONSTRAINT equipos_liga_id_fkey FOREIGN KEY (liga_id) REFERENCES ligas(id) ON DELETE CASCADE,
    UNIQUE(liga_id, nombre)
);

-- Tabla de Torneos
CREATE TABLE torneos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    liga_id uuid NOT NULL,
    nombre text NOT NULL,
    activo boolean DEFAULT true,
    CONSTRAINT torneos_pkey PRIMARY KEY (id),
    CONSTRAINT torneos_liga_id_fkey FOREIGN KEY (liga_id) REFERENCES ligas(id) ON DELETE CASCADE
);

-- Tabla de Partidos
CREATE TABLE partidos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    liga_id uuid NOT NULL,
    torneo_id uuid NOT NULL,
    equipo_local_id uuid,
    equipo_visitante_id uuid,
    marcador_local integer DEFAULT 0,
    marcador_visitante integer DEFAULT 0,
    fecha_jornada timestamp with time zone,
    estado text DEFAULT 'programado'::text CHECK (estado = ANY (ARRAY['programado'::text, 'jugado'::text, 'cancelado'::text])),
    cancha_id uuid,
    duracion_minutos integer DEFAULT 90,
    jornada integer,
    observaciones text,
    creado_por uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT partidos_pkey PRIMARY KEY (id),
    CONSTRAINT partidos_torneo_id_fkey FOREIGN KEY (torneo_id) REFERENCES torneos(id),
    CONSTRAINT partidos_equipo_local_id_fkey FOREIGN KEY (equipo_local_id) REFERENCES equipos(id),
    CONSTRAINT partidos_equipo_visitante_id_fkey FOREIGN KEY (equipo_visitante_id) REFERENCES equipos(id),
    CONSTRAINT partidos_equipo_diferente CHECK (equipo_local_id IS DISTINCT FROM equipo_visitante_id)
);

-- Tabla de User Profiles
CREATE TABLE user_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE,
    nombre character varying,
    apellido character varying,
    telefono character varying,
    fecha_nacimiento date,
    rol character varying DEFAULT 'usuario'::character varying CHECK (rol::text = ANY (ARRAY['superadmin'::character varying, 'adminadmin'::character varying, 'admin_liga'::character varying, 'capitan_equipo'::character varying, 'usuario'::character varying]::text[])),
    liga_id uuid,
    equipo_id uuid,
    es_capitan_equipo boolean DEFAULT false,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT user_profiles_liga_id_fkey FOREIGN KEY (liga_id) REFERENCES ligas(id),
    CONSTRAINT user_profiles_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

-- Tabla de Jugadores
CREATE TABLE jugadores (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    equipo_id uuid NOT NULL,
    user_profile_id uuid,
    nombre text NOT NULL,
    apellido text,
    email text,
    telefono text,
    fecha_nacimiento date,
    numero_camiseta integer,
    posicion text,
    foto_url text,
    activo boolean DEFAULT true,
    es_capitan boolean DEFAULT false,
    fecha_registro timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT jugadores_pkey PRIMARY KEY (id),
    CONSTRAINT jugadores_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    CONSTRAINT jugadores_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id),
    CONSTRAINT unique_jugador_equipo UNIQUE(equipo_id, email),
    CONSTRAINT unique_jugador_perfil UNIQUE(user_profile_id)
);

-- Tabla de Canchas
CREATE TABLE canchas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    liga_id uuid NOT NULL,
    nombre text NOT NULL,
    direccion text,
    tipo text DEFAULT 'futbol',
    superficie text DEFAULT 'natural',
    capacidad_espectadores integer DEFAULT 0,
    tiene_iluminacion boolean DEFAULT false,
    tiene_vestuarios boolean DEFAULT false,
    precio_hora decimal(10,2) DEFAULT 0,
    activa boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT canchas_pkey PRIMARY KEY (id),
    CONSTRAINT canchas_liga_id_fkey FOREIGN KEY (liga_id) REFERENCES ligas(id) ON DELETE CASCADE,
    UNIQUE(liga_id, nombre)
);

-- Tabla de Configuración de Temporada
CREATE TABLE configuraciones_temporada (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    liga_id uuid NOT NULL,
    nombre_temporada text NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    dias_juego text[],
    hora_inicio time NOT NULL,
    hora_fin time NOT NULL,
    intervalo_minutos integer DEFAULT 90,
    formato text DEFAULT 'todos_contra_todos',
    vueltas integer DEFAULT 1,
    activa boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT configuraciones_temporada_pkey PRIMARY KEY (id),
    CONSTRAINT configuraciones_temporada_liga_id_fkey FOREIGN KEY (liga_id) REFERENCES ligas(id) ON DELETE CASCADE
);

-- Tabla de Eventos de Partido
CREATE TABLE eventos_partido (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    partido_id uuid NOT NULL,
    jugador_id uuid,
    equipo_id uuid,
    tipo_evento text NOT NULL,
    minuto integer,
    descripcion text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT eventos_partido_pkey PRIMARY KEY (id),
    CONSTRAINT eventos_partido_partido_id_fkey FOREIGN KEY (partido_id) REFERENCES partidos(id) ON DELETE CASCADE,
    CONSTRAINT eventos_partido_jugador_id_fkey FOREIGN KEY (jugador_id) REFERENCES jugadores(id),
    CONSTRAINT eventos_partido_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

-- ========================================
-- 2. NOTA SOBRE auth.users
-- ========================================

-- La tabla auth.users es del sistema de Supabase y no se puede modificar directamente
-- Los usuarios deben crearse desde el panel de Supabase Authentication
-- Los UUIDs fijos en este script deben coincidir con los usuarios creados manualmente

-- ========================================
-- 3. NOTA SOBRE CREACIÓN DE USUARIOS (CRÍTICO)
-- ========================================

-- ⚠️ IMPORTANTE: Este script ahora maneja usuarios que no existen automáticamente
-- Los inserts en user_profiles y jugadores son condicionales y solo se ejecutan
-- si los usuarios correspondientes existen en auth.users

-- PASOS OBLIGATORIOS ANTES DE EJECUTAR ESTE SCRIPT:
-- 1. Ir a Supabase Dashboard → Authentication → Users
-- 2. Crear los siguientes usuarios (opcional, script funciona sin ellos):
--    - mindostech@gmail.com (AdminAdmin) → UUID: 9d7b6b96-ae99-4eab-b336-14dae92f6858
--    - admin.liga@ejemplo.com (Admin Liga) → UUID: a596bf04-7f81-4701-aa2e-7e771232bf07
--    - capitan.equipo@ejemplo.com (Capitán) → UUID: 73279c31-bfe0-4d64-9591-464e90680812
--    - jugador@ejemplo.com (Jugador) → UUID: 175949ac-67fe-4597-a6bc-df9d22f0b5f3
-- 3. Establecer contraseña: 123456 (o la que prefieras)
-- 4. Confirmar email

-- ⚠️ Si no creas los usuarios, el script igual funcionará pero:
-- - No se crearán perfiles de usuario
-- - No se crearán jugadores vinculados a usuarios
-- - Los datos de ligas, equipos y canchas sí se crearán

-- Los UUIDs fijos para las relaciones son:
-- mindostech@gmail.com → 9d7b6b96-ae99-4eab-b336-14dae92f6858
-- admin.liga@ejemplo.com → a596bf04-7f81-4701-aa2e-7e771232bf07
-- capitan.equipo@ejemplo.com → 73279c31-bfe0-4d64-9591-464e90680812
-- jugador@ejemplo.com → 175949ac-67fe-4597-a6bc-df9d22f0b5f3


-- ========================================
-- 5. INSERTAR LIGA DE EJEMPLO
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
    activa
) VALUES (
    '550e8400-e29b-41d4-a716-446655440100',  -- UUID para la liga
    'Liga de Ejemplo',
    'liga-ejemplo',
    'Liga de prueba para demostrar el funcionamiento del sistema',
    'a596bf04-7f81-4701-aa2e-7e771232bf07',  -- UUID de admin.liga@ejemplo.com
    true,
    'Oro',
    NOW(),
    NOW() + INTERVAL '1 year',
    true
) ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- 6. INSERTAR EQUIPOS DE EJEMPLO
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
    '73279c31-bfe0-4d64-9591-464e90680812',  -- UUID de capitan.equipo@ejemplo.com
    true,
    NOW(),
    NOW()
) ON CONFLICT (liga_id, nombre) DO NOTHING;

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
) ON CONFLICT (liga_id, nombre) DO NOTHING;

-- ========================================
-- 4. INSERTAR PERFILES EN user_profiles (CONDICIONAL)
-- ========================================

-- NOTA: Estos inserts solo funcionarán si los usuarios existen en auth.users
-- Si los usuarios no existen, estos inserts serán ignorados

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
) SELECT 
    '9d7b6b96-ae99-4eab-b336-14dae92f6858',  -- UUID de mindostech@gmail.com
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
WHERE EXISTS (
    SELECT 1 FROM auth.users WHERE id = '9d7b6b96-ae99-4eab-b336-14dae92f6858'
) ON CONFLICT (user_id) DO UPDATE SET 
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
) SELECT 
    'a596bf04-7f81-4701-aa2e-7e771232bf07',  -- UUID de admin.liga@ejemplo.com
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
WHERE EXISTS (
    SELECT 1 FROM auth.users WHERE id = 'a596bf04-7f81-4701-aa2e-7e771232bf07'
) ON CONFLICT (user_id) DO UPDATE SET 
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
) SELECT 
    '73279c31-bfe0-4d64-9591-464e90680812',  -- UUID de capitan.equipo@ejemplo.com
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
WHERE EXISTS (
    SELECT 1 FROM auth.users WHERE id = '73279c31-bfe0-4d64-9591-464e90680812'
) ON CONFLICT (user_id) DO UPDATE SET 
    rol = EXCLUDED.rol,
    liga_id = EXCLUDED.liga_id,
    equipo_id = EXCLUDED.equipo_id,
    es_capitan_equipo = EXCLUDED.es_capitan_equipo,
    activo = EXCLUDED.activo,
    updated_at = NOW();

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
) SELECT 
    '175949ac-67fe-4597-a6bc-df9d22f0b5f3',  -- UUID de jugador@ejemplo.com
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
WHERE EXISTS (
    SELECT 1 FROM auth.users WHERE id = '175949ac-67fe-4597-a6bc-df9d22f0b5f3'
) ON CONFLICT (user_id) DO UPDATE SET 
    rol = EXCLUDED.rol,
    liga_id = EXCLUDED.liga_id,
    equipo_id = EXCLUDED.equipo_id,
    es_capitan_equipo = EXCLUDED.es_capitan_equipo,
    activo = EXCLUDED.activo,
    updated_at = NOW();


-- ========================================
-- 7. INSERTAR JUGADORES DE EJEMPLO
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
) SELECT 
    '550e8400-e29b-41d4-a716-446655440103',  -- UUID para Martín Gómez
    '550e8400-e29b-41d4-a716-446655440101',  -- UUID de Tigres FC
    up.id,  -- user_profile_id desde user_profiles
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
FROM user_profiles up 
WHERE up.user_id = '73279c31-bfe0-4d64-9591-464e90680812'
ON CONFLICT (user_profile_id) DO NOTHING;

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
) ON CONFLICT (equipo_id, email) DO NOTHING;

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
) ON CONFLICT (equipo_id, email) DO NOTHING;

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
) SELECT 
    '550e8400-e29b-41d4-a716-446655440106',  -- UUID para Ana López
    '550e8400-e29b-41d4-a716-446655440102',  -- UUID de Leones FC
    up.id,  -- user_profile_id desde user_profiles
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
FROM user_profiles up 
WHERE up.user_id = '175949ac-67fe-4597-a6bc-df9d22f0b5f3'
ON CONFLICT (user_profile_id) DO NOTHING;

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
) ON CONFLICT (equipo_id, email) DO NOTHING;

-- ========================================
-- 8. INSERTAR CANCHAS DE EJEMPLO
-- ========================================

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
) ON CONFLICT (liga_id, nombre) DO NOTHING;

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
) ON CONFLICT (liga_id, nombre) DO NOTHING;

-- ========================================
-- 9. CREAR ÍNDICES
-- ========================================

CREATE INDEX idx_equipos_liga ON equipos(liga_id);
CREATE INDEX idx_equipos_capitan ON equipos(capitan_id);
CREATE INDEX idx_jugadores_equipo ON jugadores(equipo_id);
CREATE INDEX idx_jugadores_perfil ON jugadores(user_profile_id);
CREATE INDEX idx_jugadores_email ON jugadores(email);
CREATE INDEX idx_canchas_liga ON canchas(liga_id);
CREATE INDEX idx_partidos_liga ON partidos(liga_id);
CREATE INDEX idx_partidos_equipos ON partidos(equipo_local_id, equipo_visitante_id);
CREATE INDEX idx_partidos_fecha ON partidos(fecha_jornada);
CREATE INDEX idx_partidos_estado ON partidos(estado);
CREATE INDEX idx_configuraciones_liga ON configuraciones_temporada(liga_id);

-- ========================================
-- 10. FUNCIÓN PARA UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabla con updated_at
CREATE TRIGGER update_equipos_updated_at BEFORE UPDATE ON equipos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jugadores_updated_at BEFORE UPDATE ON jugadores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canchas_updated_at BEFORE UPDATE ON canchas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuraciones_temporada_updated_at BEFORE UPDATE ON configuraciones_temporada
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partidos_updated_at BEFORE UPDATE ON partidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 11. HABILITAR RLS
-- ========================================

ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE canchas ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_partido ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones_temporada ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 12. VERIFICACIÓN FINAL
-- ========================================

-- Mostrar todas las tablas creadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ligas', 'equipos', 'jugadores', 'canchas', 'partidos', 'eventos_partido', 'configuraciones_temporada', 'user_profiles', 'torneos')
ORDER BY table_name;

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

-- ========================================
-- INSTRUCCIONES DE USO
-- ========================================

/*
SISTEMA COMPLETO CREADO:

✅ DATOS CREADOS SIEMPRE (independientemente de usuarios):
- Liga: "Liga de Ejemplo"
- Equipos: "Tigres FC" y "Leones FC"
- Canchas: 2 disponibles
- Jugadores sin usuario: 4 jugadores adicionales

👤 USUARIOS PARA PRUEBA (si los creaste en Authentication):
- Email: mindostech@gmail.com | Rol: adminadmin | Acceso: Total al sistema
- Email: admin.liga@ejemplo.com | Rol: admin_liga | Acceso: Administrador de liga
- Email: capitan.equipo@ejemplo.com | Rol: capitan_equipo | Acceso: Capitán de equipo
- Email: jugador@ejemplo.com | Rol: usuario | Acceso: Usuario normal

CONTRASEÑAS TEMPORALES:
- Usuario: 123456 (o la que establezcas en Authentication)

📊 DATOS DE PRUEBA COMPLETOS:
- 1 liga con configuración completa
- 2 equipos con colores y logos
- 6 jugadores totales (2 con usuario, 4 sin usuario)
- 2 canchas con características diferentes

🚀 ACCESO AL SISTEMA:
1. Ejecutar este script completo en Supabase ✅
2. (Opcional) Crear usuarios en Authentication → Users
3. (Opcional) Establecer contraseñas
4. Iniciar sesión y probar cada rol
5. Acceder a /admin-admin con mindostech@gmail.com
6. Acceder a /equipos con admin.liga@ejemplo.com
7. Acceder a /equipos con capitan.equipo@ejemplo.com
8. Acceder a /roles-juego (público, sin login)

🔄 FLUJO DE PRUEBA COMPLETO:
a) Iniciar sesión como admin.liga@ejemplo.com
b) Crear/configurar temporada
c) Generar partidos con Round Robin
d) Iniciar sesión como capitan.equipo@ejemplo.com
e) Gestionar equipo y jugadores
f) Ver roles de juego públicos sin login

⚠️ IMPORTANTE:
- El script funciona AUN SIN crear usuarios en Authentication
- Si no creas usuarios, solo se crearán los datos básicos (ligas, equipos, canchas)
- Los jugadores vinculados a usuarios solo se crean si los usuarios existen

El sistema está listo para uso completo.
*/
