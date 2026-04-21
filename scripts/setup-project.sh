#!/bin/bash
# Setup script for LigaMaster SaaS project structure
# Run this after cloning the repo

echo "🏗️  Setting up LigaMaster SaaS project structure..."

# Create domain directories
echo "📁 Creating domain directories..."

# SuperAdmin domain
mkdir -p src/domains/superadmin/pages/dashboard
mkdir -p src/domains/superadmin/pages/ligas
mkdir -p src/domains/superadmin/pages/reportes
mkdir -p src/domains/superadmin/components
mkdir -p src/domains/superadmin/hooks
mkdir -p src/domains/superadmin/lib

# Liga domain
mkdir -p src/domains/liga/pages/dashboard
mkdir -p src/domains/liga/pages/canchas
mkdir -p src/domains/liga/pages/partidos
mkdir -p src/domains/liga/pages/torneos
mkdir -p src/domains/liga/pages/arbitros
mkdir -p src/domains/liga/components
mkdir -p src/domains/liga/hooks
mkdir -p src/domains/liga/lib

# Equipo domain
mkdir -p src/domains/equipo/pages/dashboard
mkdir -p src/domains/equipo/pages/jugadores
mkdir -p src/domains/equipo/pages/invitaciones
mkdir -p src/domains/equipo/pages/publico
mkdir -p src/domains/equipo/components
mkdir -p src/domains/equipo/hooks
mkdir -p src/domains/equipo/lib

# Shared domain
mkdir -p src/domains/shared/auth
mkdir -p src/domains/shared/ui
mkdir -p src/domains/shared/navigation
mkdir -p src/domains/shared/layout
mkdir -p src/domains/shared/middleware

# Shared utilities
mkdir -p src/shared/types
mkdir -p src/shared/lib
mkdir -p src/shared/config

# Tests
mkdir -p tests/superadmin
mkdir -p tests/liga
mkdir -p tests/equipo

# Docs
mkdir -p docs

echo "✅ Project structure created!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env.local and configure"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
echo ""
echo "Domain assignments:"
echo "  - Dev 1 (SuperAdmin): src/domains/superadmin/"
echo "  - Dev 2 (Liga): src/domains/liga/"
echo "  - Dev 3 (Equipo): src/domains/equipo/"
echo "  - Shared: src/domains/shared/ (collaborative)"
