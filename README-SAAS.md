# LigaMaster SaaS - Sistema de Gestión de Ligas Deportivas

## 🚀 Descripción General

LigaMaster SaaS es una plataforma multi-tenant que permite gestionar múltiples ligas deportivas bajo un modelo de suscripción. Cada liga funciona como un "inquilino" (tenant) independiente con su propio acceso y administración.

## 🏗️ Arquitectura del Sistema

### Modelo Multi-Tenant
- **Tenant**: Cada liga es un cliente independiente
- **Subdominios**: Cada liga tiene su propia URL (ej: `liga-toluca.ligamaster.com`)
- **Aislamiento de datos**: Cada liga solo ve y gestiona sus propios datos

### Planes de Suscripción
- **Bronce**: $100/mes - Funcionalidades básicas
- **Plata**: $200/mes - Funcionalidades intermedias  
- **Oro**: $500/mes - Todas las funcionalidades

## 📋 Funcionalidades Implementadas

### 1. Panel de SuperAdmin
- **Dashboard con métricas**: Total de ligas, activas/inactivas, ingresos mensuales
- **Gestión de Ligas (CRUD)**: Crear, editar, suspender ligas
- **Simulación de Pagos**: Procesar pagos y gestionar suscripciones
- **Control de Acceso**: Solo usuarios autorizados pueden acceder

### 2. Sistema de Autenticación
- **Roles de Usuario**: SuperAdmin vs Usuarios normales
- **Protección de Rutas**: Middleware que verifica permisos
- **Control de Acceso por Email**: Lista de emails autorizados para SuperAdmin

### 3. Middleware de Verificación
- **Verificación de Estatus**: Revisa si la liga está activa y pagada
- **Redirección Automática**: A páginas de suspensión si no está al día
- **Control de Acceso**: Impide el acceso a ligas inactivas

### 4. Gestión de Pagos
- **Simulación de Pasarela**: Procesamiento simulado de pagos
- **Control de Suscripciones**: Activación/desactivación por pago
- **Historial de Pagos**: Registro completo de transacciones

## 🗄️ Estructura de Base de Datos

### Tabla `ligas`
```sql
CREATE TABLE ligas (
  id UUID PRIMARY KEY,
  nombre_liga VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  logo_url VARCHAR(500),
  fecha_registro TIMESTAMP DEFAULT NOW(),
  fecha_vencimiento TIMESTAMP,
  estatus_pago BOOLEAN DEFAULT false,
  plan VARCHAR(20) DEFAULT 'Bronce',
  owner_id UUID REFERENCES auth.users(id),
  contacto_email VARCHAR(255),
  contacto_telefono VARCHAR(50),
  activa BOOLEAN DEFAULT true
);
```

### Tabla `pagos`
```sql
CREATE TABLE pagos (
  id UUID PRIMARY KEY,
  liga_id UUID REFERENCES ligas(id),
  monto DECIMAL(10,2) NOT NULL,
  fecha_pago TIMESTAMP DEFAULT NOW(),
  metodo_pago VARCHAR(50) DEFAULT 'simulado',
  estatus VARCHAR(20) DEFAULT 'completado',
  referencia VARCHAR(255),
  meses_contratados INTEGER DEFAULT 1
);
```

## 🔧 Configuración del Proyecto

### Variables de Entorno
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Instalación
```bash
npm install
npm run dev
```

## 📁 Estructura de Archivos

```
src/
├── app/
│   ├── admin/                 # Panel de SuperAdmin
│   │   └── page.tsx
│   ├── liga-suspendida/       # Página de suspensión
│   ├── liga-inactiva/         # Página de liga inactiva
│   └── liga-no-encontrada/    # Página de no encontrado
├── components/
│   └── admin/
│       ├── DashboardMetrics.tsx     # Dashboard con métricas
│       ├── LigaManagement.tsx       # CRUD de ligas
│       └── PaymentSimulation.tsx    # Simulación de pagos
├── lib/
│   ├── auth-simple.ts              # Sistema de autenticación
│   ├── supabase.ts               # Cliente de Supabase
│   └── auth.ts                   # Funciones de auth (server)
├── middleware.ts                  # Middleware de verificación
└── database/
    └── schema.sql                 # Esquema de base de datos
```

## 🔐 Sistema de Seguridad

### Autenticación
- **SuperAdmin Protection**: Componente que protege rutas administrativas
- **Email Whitelist**: Solo emails específicos pueden ser SuperAdmin
- **Session Management**: Gestión de sesiones con Supabase Auth

### Control de Acceso
- **Middleware**: Verificación automática de estatus de ligas
- **Row Level Security**: Políticas de seguridad en Supabase
- **Role-Based Access**: Acceso basado en roles de usuario

## 💳 Flujo de Pagos

### 1. Registro de Liga
1. SuperAdmin crea nueva liga
2. Liga se crea con `estatus_pago = false`
3. Acceso limitado hasta primer pago

### 2. Proceso de Pago
1. SuperAdmin selecciona liga y meses a contratar
2. Sistema calcula monto según plan
3. Simulación de procesamiento
4. Actualización de estatus y fecha de vencimiento

### 3. Verificación de Acceso
1. Middleware intercepta solicitudes a ligas
2. Verifica estatus de pago y activación
3. Permite o redirige según corresponda

## 🎯 Casos de Uso

### Para SuperAdmin
- Crear y gestionar ligas
- Monitorear métricas del negocio
- Procesar pagos y renovaciones
- Suspender ligas por falta de pago

### Para Usuarios de Liga
- Acceder a su liga si está pagada
- Ver información de su liga
- Recibir notificaciones de pago

### Para el Público
- Buscar ligas activas
- Ver información pública
- Solicitar acceso a ligas

## 🚀 Despliegue

### 1. Configurar Supabase
- Crear proyecto en Supabase
- Ejecutar script `database/schema.sql`
- Configurar variables de entorno

### 2. Configurar Dominios
- Configurar wildcard DNS para subdominios
- Configurar SSL certificates
- Actualizar middleware para manejo de subdominios

### 3. Desplegar Aplicación
- Build del proyecto: `npm run build`
- Deploy en Vercel/Netlify/etc.
- Configurar variables de entorno

## 🔮 Mejoras Futuras

### Funcionalidades Planeadas
- [ ] Integración con pasarela de pagos real (Stripe)
- [ ] Sistema de notificaciones por email
- [ ] Dashboard para administradores de liga
- [ ] Módulo de jugadores y equipos
- [ ] Sistema de estadísticas
- [ ] API pública para integraciones

### Mejoras Técnicas
- [ ] Caching de métricas
- [ ] Optimización de consultas
- [ ] Sistema de logs y auditoría
- [ ] Testing automatizado
- [ ] CI/CD pipeline

## 📞 Soporte

Para dudas o soporte técnico:
- Email: soporte@ligamaster.com
- Documentación: [Wiki del Proyecto]
- Issues: [GitHub Repository]

---

**Nota**: Este es un proyecto educativo para demostrar la implementación de un modelo SaaS con Next.js y Supabase.
