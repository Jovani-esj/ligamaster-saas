-- Tabla de Ligas (Tenants) para el modelo SaaS
CREATE TABLE IF NOT EXISTS ligas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_liga VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- URL única ej: "liga-toluca"
  descripcion TEXT,
  logo_url VARCHAR(500),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_vencimiento TIMESTAMP WITH TIME ZONE, -- Fecha de vencimiento del pago
  estatus_pago BOOLEAN DEFAULT false, -- true = pagado, false = suspendido
  plan VARCHAR(20) DEFAULT 'Bronce' CHECK (plan IN ('Bronce', 'Plata', 'Oro')),
  owner_id UUID REFERENCES auth.users(id), -- Usuario dueño de la liga
  contacto_email VARCHAR(255),
  contacto_telefono VARCHAR(50),
  activa BOOLEAN DEFAULT true, -- Para soft delete
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_ligas_slug ON ligas(slug);
CREATE INDEX IF NOT EXISTS idx_ligas_estatus_pago ON ligas(estatus_pago);
CREATE INDEX IF NOT EXISTS idx_ligas_owner_id ON ligas(owner_id);
CREATE INDEX IF NOT EXISTS idx_ligas_activa ON ligas(activa);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ligas_updated_at BEFORE UPDATE
    ON ligas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla de suscripciones/pagos simulados
CREATE TABLE IF NOT EXISTS pagos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  liga_id UUID REFERENCES ligas(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metodo_pago VARCHAR(50) DEFAULT 'simulado', -- 'simulado', 'tarjeta', etc.
  estatus VARCHAR(20) DEFAULT 'completado' CHECK (estatus IN ('pendiente', 'completado', 'fallido')),
  referencia VARCHAR(255), -- Referencia del pago
  meses_contratados INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permisos de Row Level Security (RLS)
ALTER TABLE ligas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ligas
CREATE POLICY "Los usuarios públicos pueden ver ligas activas y pagadas" ON ligas
  FOR SELECT USING (activa = true AND estatus_pago = true);

CREATE POLICY "Solo superadmins pueden insertar ligas" ON ligas
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'superadmin');

CREATE POLICY "Dueños y superadmins pueden actualizar ligas" ON ligas
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'superadmin' OR auth.uid() = owner_id);

-- Políticas RLS para pagos
CREATE POLICY "Solo superadmins pueden ver pagos" ON pagos
  FOR SELECT USING (auth.jwt() ->> 'role' = 'superadmin');

CREATE POLICY "Solo superadmins pueden insertar pagos" ON pagos
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'superadmin');

-- Tabla de perfiles de usuario extendidos
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255),
  apellido VARCHAR(255),
  telefono VARCHAR(50),
  fecha_nacimiento DATE,
  rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('superadmin', 'admin_liga', 'usuario')),
  liga_id UUID REFERENCES ligas(id) ON DELETE SET NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_liga_id ON user_profiles(liga_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_rol ON user_profiles(rol);

-- Trigger para updated_at en user_profiles
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE
    ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla de sesiones activas (opcional, para tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  liga_id UUID REFERENCES ligas(id) ON DELETE SET NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Políticas RLS para user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Solo superadmins pueden insertar perfiles" ON user_profiles
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'superadmin' OR auth.uid() = user_id);

-- Función para verificar si una liga está activa y pagada
CREATE OR REPLACE FUNCTION verificar_estatus_liga(liga_slug_param VARCHAR)
RETURNS TABLE(
  activa BOOLEAN,
  pagada BOOLEAN,
  nombre_liga VARCHAR,
  plan VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.activa,
    l.estatus_pago,
    l.nombre_liga,
    l.plan
  FROM ligas l
  WHERE l.slug = liga_slug_param AND l.activa = true;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener ligas de un usuario
CREATE OR REPLACE FUNCTION obtener_ligas_usuario(usuario_id UUID)
RETURNS TABLE(
  id UUID,
  nombre_liga VARCHAR,
  slug VARCHAR,
  plan VARCHAR,
  estatus_pago BOOLEAN,
  rol_usuario VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.nombre_liga,
    l.slug,
    l.plan,
    l.estatus_pago,
    up.rol
  FROM ligas l
  LEFT JOIN user_profiles up ON l.id = up.liga_id
  WHERE up.user_id = usuario_id AND up.activo = true;
END;
$$ LANGUAGE plpgsql;
