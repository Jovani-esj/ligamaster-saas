# Guía de Contribución - LigaMaster SaaS

## 🎯 Equipo de Desarrollo

| Dev | Rol | Dominio | Email/Usuario Git |
|-----|-----|---------|-------------------|
| Dev 1 | SuperAdmin | `superadmin` | @dev1-superadmin |
| Dev 2 | Admin Liga + Árbitro | `liga` | @dev2-liga |
| Dev 3 | Capitán + Público | `equipo` | @dev3-equipo |

---

## 🌿 Flujo de Trabajo Git

### 1. Preparar tu entorno

```bash
# 1. Clonar el repo
git clone https://github.com/tu-org/ligamaster-saas.git
cd ligamaster-saas

# 2. Instalar dependencias
npm install

# 3. Crear tu archivo .env.local
cp .env.example .env.local
# Editar con tus credenciales de Supabase

# 4. Verificar que todo funciona
npm run build
npm run dev
```

### 2. Empezar una nueva tarea

```bash
# 1. Asegúrate de estar en develop y actualizado
git checkout develop
git pull origin develop

# 2. Crear tu feature branch
# Formato: feature/{dominio}/{descripcion-corta}
git checkout -b feature/superadmin/tenant-middleware
# o
git checkout -b feature/liga/round-robin-algorithm
# o
git checkout -b feature/equipo/player-stats-view
```

### 3. Mientras desarrollas

```bash
# Commits frecuentes con mensajes claros
git add .
git commit -m "feat(superadmin): add payment status check middleware"

# Push a tu branch remota (para backup y colaboración)
git push origin feature/superadmin/tenant-middleware
```

#### Convención de Commits (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: Nueva feature
- `fix`: Bug fix
- `docs`: Cambios en documentación
- `style`: Formato (espacios, punto y coma, etc)
- `refactor`: Refactorización de código
- `test`: Tests
- `chore`: Mantenimiento (build, deps, etc)

**Scopes (dominios):**
- `superadmin`
- `liga`
- `equipo`
- `shared`
- `auth`
- `ui`

**Ejemplos:**
```bash
git commit -m "feat(liga): implement round-robin schedule generator"
git commit -m "fix(equipo): resolve player form validation error"
git commit -m "refactor(shared): optimize auth middleware"
git commit -m "test(superadmin): add tenant isolation tests"
git commit -m "docs(readme): update deployment instructions"
```

### 4. Antes de crear el PR

```bash
# 1. Actualizar tu branch con develop
git checkout develop
git pull origin develop
git checkout feature/tu-branch
git rebase develop

# 2. Resolver conflictos si hay
# (editar archivos, luego:)
git add .
git rebase --continue

# 3. Verificar que todo funciona
npm run lint
npm run typecheck
npm run build
npm run test

# 4. Push final
git push origin feature/tu-branch --force-with-lease
```

### 5. Crear Pull Request

1. Ve a GitHub y crea PR de tu branch a `develop`
2. Completa el template del PR
3. Asigna reviewers según CODEOWNERS
4. Espera aprobaciones

**Reglas de aprobación:**
- Cambios en tu dominio: 1 aprobación de otro dev
- Cambios en `shared/`: 2 aprobaciones (uno de cada otro dev)
- Cambios en tipos base de datos: Todos los devs deben revisar

### 6. Después del merge

```bash
# 1. Limpiar tu local
git checkout develop
git pull origin develop
git branch -d feature/tu-branch

# 2. Empezar siguiente tarea (ir a paso 2)
```

---

## 📁 Estructura de Código

### Organización por Dominio

```
src/domains/{dominio}/
├── pages/           # Rutas Next.js
├── components/      # Componentes React
├── hooks/           # Custom hooks
├── lib/             # Funciones utilitarias
└── types.ts         # Extensiones de tipos
```

### Reglas de Organización

1. **Cada dominio es independiente**: No importar de otros dominios directamente
2. **Todo pasa por `shared/`**: Componentes compartidos, hooks comunes, utilidades
3. **Tipos en un solo lugar**: `src/shared/types/database.ts` es la fuente de verdad
4. **Colores de cada dominio**:
   - SuperAdmin: Rojo/Alerta (`red-600`)
   - Liga: Azul/Deportivo (`blue-600`)
   - Equipo: Verde/Equipo (`green-600`)

### Imports Permitidos

```typescript
// ✅ Correcto - dentro de tu dominio
import { DashboardCard } from '@/domains/superadmin/components/DashboardCard';

// ✅ Correcto - desde shared
import { Button } from '@/domains/shared/ui/Button';
import { useAuth } from '@/domains/shared/auth/useAuth';

// ✅ Correcto - tipos globales
import type { Liga, Equipo } from '@/shared/types/database';

// ❌ Incorrecto - importar de otro dominio directamente
import { CanchaCard } from '@/domains/liga/components/CanchaCard'; // NO!
// Usar en su lugar: mover a shared o exponer vía API
```

---

## 🗄️ Base de Datos y Migraciones

### Convención de Nombres

```
{numero}_{dominio}_{descripcion}.sql
```

**Ejemplos:**
- `001_superadmin_create_ligas_table.sql`
- `002_liga_create_canchas_table.sql`
- `003_equipo_create_jugadores_table.sql`
- `004_liga_add_arbitros_table.sql`

### Reglas de Migraciones

1. **Nunca editar migraciones existentes** - Siempre crear nueva
2. **Numero correlativo** - Usar timestamp o secuencia
3. **Dominio claro** - Prefijo indica quién es responsable
4. **Reversible** - Siempre incluir `DOWN` migration

### Ejemplo de Migración

```sql
-- 005_liga_create_partidos_table.sql
-- UP
CREATE TABLE partidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liga_id UUID REFERENCES ligas(id) ON DELETE CASCADE,
    equipo_local_id UUID REFERENCES equipos(id),
    equipo_visitante_id UUID REFERENCES equipos(id),
    fecha_jornada TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'programado',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- DOWN
DROP TABLE IF EXISTS partidos;
```

---

## 🔄 Resolución de Conflictos

### Escenario 1: Conflicto en tu branch personal

```bash
git checkout tu-branch
git rebase develop
# Resolver conflictos en archivos
git add .
git rebase --continue
```

### Escenario 2: Conflicto en tipos compartidos (CRÍTICO)

Si dos devs modifican `database.ts` al mismo tiempo:

1. **NO resolver solo** - Llamar a los otros devs
2. **Reunión rápida** - Acordar cambios en tipos
3. **Un solo PR** - Un dev lidera, otros revisan

### Escenario 3: Hotfix urgente

```bash
# Solo para fixes críticos en producción
git checkout main
git checkout -b hotfix/fix-auth-crash
# ... fix ...
git commit -m "hotfix: resolve auth crash on login"
git push origin hotfix/fix-auth-crash
# Crear PR a main Y a develop
```

---

## 🚨 Prohibiciones

❌ **NUNCA:**
- Hacer push directo a `main` o `develop`
- Mergear tu propio PR sin revisión
- Editar migraciones ya aplicadas en develop
- Importar directamente entre dominios
- Subir `.env` o credenciales
- Dejar `console.log` en código de producción

✅ **SIEMPRE:**
- Crear PR desde feature branch
- Pedir revisión a otro dev
- Actualizar `.env.example` si agregas variables
- Escribir tests para lógica compleja
- Documentar funciones complejas

---

## 📞 Comunicación

### Daily Standup (opcional)
- Qué hice ayer
- Qué haré hoy
- Bloqueos/ayuda necesaria

### Reviews Asíncronos
- Usar comentarios en GitHub
- Responder en 24 horas máximo
- Ser constructivo y específico

### Conflictos de Diseño
- Crear issue de discusión
- Involucrar a todos los devs afectados
- Decisión por consenso o lead decide

---

## 🎓 Recursos

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)

---

## 📋 Checklist Pre-Entrega

Antes de considerar una feature "lista":

- [ ] Código funciona localmente
- [ ] Tests pasan (`npm run test`)
- [ ] Build exitoso (`npm run build`)
- [ ] No hay errores de lint (`npm run lint`)
- [ ] No hay errores de TypeScript (`npm run typecheck`)
- [ ] PR creado con descripción clara
- [ ] Reviewers asignados
- [ ] Documentación actualizada (si aplica)
