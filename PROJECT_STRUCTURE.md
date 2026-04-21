# LigaMaster SaaS - Estructura de Proyecto Reorganizada

## 🏗️ Estructura por Dominios

```
src/
├── domains/                    # Organización por dominio de negocio
│   ├── superadmin/            # Dev 1: Gestión de plataforma
│   │   ├── components/        # Componentes SuperAdmin
│   │   ├── hooks/             # Hooks específicos
│   │   ├── lib/               # Funciones de gestión de tenants
│   │   └── types.ts           # Tipos extendidos
│   │
│   ├── liga/                  # Dev 2: Lógica deportiva
│   │   ├── components/        # Canchas, partidos, torneos
│   │   ├── hooks/             # Hooks de programación
│   │   ├── lib/
│   │   │   └── roundRobinScheduler.ts  # Algoritmo académico
│   │   └── types.ts           # Tipos extendidos
│   │
│   ├── equipo/                # Dev 3: Equipos y jugadores
│   │   ├── components/        # Gestión de jugadores
│   │   ├── hooks/             # Hooks de equipo
│   │   ├── lib/               # Funciones de equipo
│   │   └── types.ts           # Tipos extendidos
│   │
│   └── shared/                # Colaborativo: Componentes base
│       ├── auth/
│       │   └── SimpleAuthenticationSystem.tsx
│       ├── ui/                # Componentes UI
│       ├── navigation/        # Navegación
│       ├── layout/            # Layouts
│       └── middleware/        # Middleware de auth
│
├── shared/                     # Utilidades globales
│   ├── types/
│   │   └── database.ts        # Fuente de verdad de tipos
│   ├── lib/                   # Utilidades (mantener compatibilidad)
│   └── config/                # Configuración
│
└── app/                        # Next.js App Router (NO mover)
    ├── admin/                 # Rutas de Admin Liga
    ├── admin-admin/           # Rutas de SuperAdmin
    ├── equipos/               # Rutas de Equipos
    └── ...                    # Otras rutas
```

## 👥 Asignación por Desarrollador

### Dev 1: SuperAdmin (@dev1-superadmin)
**Responsabilidad:** Gestión de tenants, suscripciones, plataforma global

**Nuevos paths:**
- `src/domains/superadmin/components/*`
- `src/domains/superadmin/hooks/*`
- `src/domains/superadmin/lib/*`

**Migraciones pendientes:**
- [ ] Mover `src/components/admin/*` → `src/domains/superadmin/components/`
- [ ] Mover funciones de gestión de ligas desde `src/lib/database.ts`

### Dev 2: Liga (@dev2-liga)
**Responsabilidad:** Lógica deportiva, canchas, partidos, árbitros

**Nuevos paths:**
- `src/domains/liga/components/*`
- `src/domains/liga/hooks/*`
- `src/domains/liga/lib/roundRobinScheduler.ts` ✅

**Migraciones pendientes:**
- [ ] Mover `src/components/canchas/*` → `src/domains/liga/components/canchas/`
- [ ] Mover `src/components/partidos/*` → `src/domains/liga/components/partidos/`
- [ ] Mover `src/components/dashboard/*` (parte de liga)

### Dev 3: Equipo (@dev3-equipo)
**Responsabilidad:** Equipos, jugadores, vista pública

**Nuevos paths:**
- `src/domains/equipo/components/*`
- `src/domains/equipo/hooks/*`
- `src/domains/equipo/lib/*`

**Migraciones pendientes:**
- [ ] Mover `src/components/equipos/*` → `src/domains/equipo/components/`

## 📦 Imports Actualizados

### Nuevos paths de importación

```typescript
// Tipos (fuente de verdad)
import { Liga, Equipo, UserProfile } from '@/shared/types/database';

// Auth (compartido)
import { useSimpleAuth } from '@/domains/shared/auth/SimpleAuthenticationSystem';

// Dominio Liga
import { RoundRobinScheduler } from '@/domains/liga/lib/roundRobinScheduler';

// Dominio SuperAdmin (cuando se migre)
// import { AdminDashboard } from '@/domains/superadmin/components/AdminDashboard';

// Dominio Equipo (cuando se migre)
// import { PlayerList } from '@/domains/equipo/components/PlayerList';
```

### Compatibilidad mantenida

Los archivos originales siguen funcionando:
- `@/types/database` → apunta a `src/types/database.ts` (original)
- `@/components/auth/*` → apunta a `src/components/auth/*` (original)
- `@/lib/database` → apunta a `src/lib/database.ts` (original)

## 🚀 Guía de Migración Gradual

### Paso 1: Empezar a usar nuevos paths
Los desarrolladores pueden importar desde los nuevos dominios inmediatamente:

```typescript
// Nuevo - Recomendado
import { RoundRobinScheduler } from '@/domains/liga/lib/roundRobinScheduler';

// Viejo - Todavía funciona
import { RoundRobinScheduler } from '@/lib/roundRobinScheduler';
```

### Paso 2: Migrar componentes por dominio
Cada dev migra sus componentes cuando esté listo:

```bash
# Ejemplo: Dev 2 migra componentes de canchas
git checkout -b feature/liga/migrate-canchas-components
# Mover archivos
# Actualizar imports
# Crear PR
```

### Paso 3: Actualizar index.ts
Una vez migrados los archivos, descomentar en el `index.ts` del dominio:

```typescript
// src/domains/liga/index.ts
export * from './components';  // Descomentar cuando se migren
```

### Paso 4: Remover archivos originales
Cuando todo esté migrado y probado, remover archivos originales.

## ✅ Estado Actual

### Completado ✅
- [x] Estructura de carpetas creada
- [x] `src/domains/liga/lib/roundRobinScheduler.ts` migrado
- [x] `src/shared/types/database.ts` creado (copia de tipos)
- [x] `src/domains/shared/auth/SimpleAuthenticationSystem.tsx` migrado
- [x] Archivos `index.ts` creados para cada dominio
- [x] GitHub CODEOWNERS configurado
- [x] GitHub Actions CI configurado
- [x] Build funciona correctamente

### Pendiente ⏳
- [ ] Migrar componentes de `src/components/admin/*`
- [ ] Migrar componentes de `src/components/canchas/*`
- [ ] Migrar componentes de `src/components/equipos/*`
- [ ] Migrar componentes de `src/components/partidos/*`
- [ ] Migrar UI components a `src/domains/shared/ui/`
- [ ] Migrar navigation a `src/domains/shared/navigation/`
- [ ] Actualizar imports en páginas de `src/app/`
- [ ] Remover archivos originales duplicados

## 🔄 Flujo Git/GitHub

Ver `CONTRIBUTING.md` para detalles completos.

Resumen rápido:
```bash
# Feature branches por dominio
git checkout -b feature/superadmin/nombre-feature    # Dev 1
git checkout -b feature/liga/nombre-feature          # Dev 2
git checkout -b feature/equipo/nombre-feature        # Dev 3

# Commits con prefijo de dominio
git commit -m "feat(liga): add round robin algorithm"

# PRs automáticamente asignados por CODEOWNERS
```

## 🧪 Testing

```bash
# Verificar build
npm run build

# Pre-commit checks
./scripts/pre-commit-check.sh
```

## 📚 Documentación Adicional

- `CONTRIBUTING.md` - Guía completa de contribución
- `.github/CODEOWNERS` - Asignación de reviewers
- `.github/workflows/ci.yml` - Pipeline de CI/CD
- `scripts/setup-project.sh` - Setup inicial
- `scripts/pre-commit-check.sh` - Verificación pre-commit
