'use client';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Menu, X, Trophy, Settings, Home, LogOut, User, Users, MapPin, Calendar, 
  Shield, FileText, DollarSign, BarChart3, CheckCircle, UserPlus,
  Clock, Award, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
  requiresAuth?: boolean;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function RoleBasedNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useSimpleAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const isAuthenticated = !!user;

  // Definición de elementos de navegación por rol
  const publicNavItems: NavItem[] = [
    {
      href: '/',
      label: 'Inicio',
      icon: Home,
      roles: ['all'],
      requiresAuth: false
    },
    {
      href: '/ligas',
      label: 'Ligas',
      icon: Trophy,
      roles: ['all'],
      requiresAuth: false
    },
    {
      href: '/roles-juego',
      label: 'Roles de Juego',
      icon: Calendar,
      roles: ['all'],
      requiresAuth: false
    }
  ];

  const authenticatedNavItems: NavSection[] = [
    {
      title: 'Principal',
      items: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: BarChart3,
          roles: ['superadmin', 'adminadmin', 'admin_liga', 'capitan_equipo', 'usuario'],
          requiresAuth: true,
          badge: 'Nuevo'
        },
        {
          href: '/perfil',
          label: 'Mi Perfil',
          icon: User,
          roles: ['superadmin', 'adminadmin', 'admin_liga', 'capitan_equipo', 'usuario'],
          requiresAuth: true
        }
      ]
    },
    {
      title: 'Gestión de Equipos',
      items: [
        {
          href: '/equipos',
          label: 'Equipos',
          icon: Users,
          roles: ['admin_liga', 'capitan_equipo'],
          requiresAuth: true
        },
        {
          href: '/gestion-jugadores',
          label: 'Gestionar Jugadores',
          icon: UserPlus,
          roles: ['capitan_equipo'],
          requiresAuth: true
        }
      ]
    },
    {
      title: 'Administración de Liga',
      items: [
        {
          href: '/canchas',
          label: 'Canchas',
          icon: MapPin,
          roles: ['admin_liga'],
          requiresAuth: true
        },
        {
          href: '/programacion-partidos',
          label: 'Programación',
          icon: Calendar,
          roles: ['admin_liga'],
          requiresAuth: true
        },
        {
          href: '/aprobaciones',
          label: 'Aprobaciones',
          icon: CheckCircle,
          roles: ['admin_liga'],
          requiresAuth: true,
          badge: 'Pendientes'
        },
        {
          href: '/estadisticas',
          label: 'Estadísticas',
          icon: TrendingUp,
          roles: ['admin_liga'],
          requiresAuth: true
        },
        {
          href: '/pagos',
          label: 'Gestión de Pagos',
          icon: DollarSign,
          roles: ['admin_liga'],
          requiresAuth: true
        }
      ]
    },
    {
      title: 'Super Administración',
      items: [
        {
          href: '/admin-admin',
          label: 'Panel Admin',
          icon: Settings,
          roles: ['adminadmin', 'superadmin'],
          requiresAuth: true
        },
        {
          href: '/gestion-ligas',
          label: 'Gestionar Ligas',
          icon: Trophy,
          roles: ['adminadmin', 'superadmin'],
          requiresAuth: true
        },
        {
          href: '/reportes',
          label: 'Reportes',
          icon: FileText,
          roles: ['adminadmin', 'superadmin'],
          requiresAuth: true
        },
        {
          href: '/configuracion-sistema',
          label: 'Configuración',
          icon: Shield,
          roles: ['superadmin'],
          requiresAuth: true
        }
      ]
    },
    {
      title: 'Jugador',
      items: [
        {
          href: '/mis-partidos',
          label: 'Mis Partidos',
          icon: Calendar,
          roles: ['usuario'],
          requiresAuth: true
        },
        {
          href: '/estadisticas-personales',
          label: 'Mis Estadísticas',
          icon: Award,
          roles: ['usuario'],
          requiresAuth: true
        },
        {
          href: '/historial',
          label: 'Historial',
          icon: Clock,
          roles: ['usuario'],
          requiresAuth: true
        }
      ]
    }
  ];

  // Función para verificar si un usuario tiene acceso a un elemento
  const hasAccess = (item: NavItem): boolean => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.roles.includes('all')) return true;
    if (!profile) return false;
    return item.roles.includes(profile.rol);
  };

  // Filtrar elementos de navegación según el rol
  const filteredNavItems = authenticatedNavItems.map(section => ({
    ...section,
    items: section.items.filter(hasAccess)
  })).filter(section => section.items.length > 0);

  const renderNavItem = (item: NavItem, isMobile: boolean = false) => {
    const Icon = item.icon;
    const baseClasses = isMobile
      ? "flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
      : "flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors";

    return (
      <Link
        key={item.href}
        href={item.href}
        className={baseClasses}
        onClick={() => isMobile && setIsOpen(false)}
      >
        <Icon className={isMobile ? "h-4 w-4" : "h-4 w-4"} />
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LigaMaster</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Items públicos */}
            {publicNavItems.map(item => hasAccess(item) && renderNavItem(item))}
            
            {/* Separador */}
            {isAuthenticated && (
              <div className="h-6 w-px bg-gray-300" />
            )}

            {/* Items autenticados */}
            {isAuthenticated && filteredNavItems.map(section => (
              <div key={section.title} className="flex items-center space-x-4">
                {section.items.map(item => renderNavItem(item))}
              </div>
            ))}

            {/* Auth buttons */}
            {!isAuthenticated ? (
              <>
                <Link 
                  href="/auth/simple-login" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Iniciar Sesión</span>
                </Link>
                <Link 
                  href="/auth/simple-register" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Registrarse</span>
                </Link>
              </>
            ) : (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Items públicos */}
              {publicNavItems.map(item => hasAccess(item) && renderNavItem(item, true))}
              
              {/* Separador móvil */}
              {isAuthenticated && (
                <div className="border-t border-gray-200 my-2" />
              )}

              {/* Items autenticados por sección */}
              {isAuthenticated && filteredNavItems.map(section => (
                <div key={section.title}>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </div>
                  {section.items.map(item => renderNavItem(item, true))}
                </div>
              ))}

              {/* Auth buttons móvil */}
              {!isAuthenticated ? (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  {renderNavItem({
                    href: '/auth/simple-login',
                    label: 'Iniciar Sesión',
                    icon: User,
                    roles: ['all'],
                    requiresAuth: false
                  }, true)}
                  {renderNavItem({
                    href: '/auth/simple-register',
                    label: 'Registrarse',
                    icon: User,
                    roles: ['all'],
                    requiresAuth: false
                  }, true)}
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
