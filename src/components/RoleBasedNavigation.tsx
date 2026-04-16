'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Menu, X, Trophy, Settings, Home, LogOut, User, Users, MapPin, Calendar, 
  Shield, FileText, DollarSign, BarChart3, CheckCircle, UserPlus,
  Clock, Award, TrendingUp, ChevronRight
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
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const pathname = usePathname();
  const { user, profile, signOut } = useSimpleAuth();
  
  const desktopSidebarRef = useRef<HTMLElement>(null);
  const mobileSidebarRef = useRef<HTMLElement>(null);
  const desktopButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  // Cerrar menús al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Desktop sidebar
      if (isDesktopOpen && 
          desktopSidebarRef.current && 
          !desktopSidebarRef.current.contains(target) &&
          desktopButtonRef.current &&
          !desktopButtonRef.current.contains(target)) {
        setIsDesktopOpen(false);
      }
      
      // Mobile sidebar
      if (isOpen && 
          mobileSidebarRef.current && 
          !mobileSidebarRef.current.contains(target) &&
          mobileButtonRef.current &&
          !mobileButtonRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDesktopOpen, isOpen]);

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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
          active 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
        <span className="font-medium text-sm">{item.label}</span>
        {item.badge && (
          <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
            {item.badge}
          </span>
        )}
        {active && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
      </Link>
    );
  };

  const renderSection = (section: NavSection) => (
    <div key={section.title} className="mb-6">
      <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {section.title}
      </h3>
      <div className="space-y-1">
        {section.items.map(item => renderNavItem(item))}
      </div>
    </div>
  );

  return (
    <>
      {/* Top Bar con logo y botón hamburguesa */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-40 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            ref={desktopButtonRef}
            variant="ghost"
            size="icon"
            onClick={() => setIsDesktopOpen(!isDesktopOpen)}
            className="hidden lg:flex hover:bg-gray-100"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </Button>
          <Button
            ref={mobileButtonRef}
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="lg:hidden hover:bg-gray-100"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            <Trophy className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">LigaMaster</span>
          </Link>
        </div>

        {/* Info de usuario en top bar */}
        {isAuthenticated && profile && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{profile.nombre || user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{profile.rol.replace(/_/g, ' ')}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        )}
      </header>

      {/* Sidebar Desktop - Drawer */}
      <aside 
        ref={desktopSidebarRef}
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 shadow-xl z-40 transition-transform duration-300 ease-in-out hidden lg:flex flex-col ${
          isDesktopOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {/* Items públicos */}
          <div className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Público
            </h3>
            <div className="space-y-1">
              {publicNavItems.map(item => hasAccess(item) && renderNavItem(item))}
            </div>
          </div>

          {/* Items autenticados */}
          {isAuthenticated && filteredNavItems.map(renderSection)}

          {/* Auth section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            {!isAuthenticated ? (
              <div className="space-y-1">
                {renderNavItem({
                  href: '/auth/simple-login',
                  label: 'Iniciar Sesión',
                  icon: User,
                  roles: ['all'],
                  requiresAuth: false
                })}
                {renderNavItem({
                  href: '/auth/simple-register',
                  label: 'Registrarse',
                  icon: UserPlus,
                  roles: ['all'],
                  requiresAuth: false
                })}
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium text-sm">Cerrar Sesión</span>
              </button>
            )}
          </div>
        </div>

        {/* Versión o footer del sidebar */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">LigaMaster SaaS v1.0</p>
        </div>
      </aside>

      {/* Overlay móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Móvil */}
      <aside 
        ref={mobileSidebarRef}
        className={`fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header móvil */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
            <Trophy className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">LigaMaster</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5 text-gray-700" />
          </Button>
        </div>

        {/* Info de usuario móvil */}
        {isAuthenticated && profile && (
          <div className="p-4 bg-blue-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{profile.nombre || user?.email}</p>
                <p className="text-xs text-blue-600 capitalize">{profile.rol.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contenido móvil */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {/* Items públicos */}
          <div className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Público
            </h3>
            <div className="space-y-1">
              {publicNavItems.map(item => hasAccess(item) && renderNavItem(item))}
            </div>
          </div>

          {/* Items autenticados */}
          {isAuthenticated && filteredNavItems.map(renderSection)}

          {/* Auth section móvil */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            {!isAuthenticated ? (
              <div className="space-y-1">
                {renderNavItem({
                  href: '/auth/simple-login',
                  label: 'Iniciar Sesión',
                  icon: User,
                  roles: ['all'],
                  requiresAuth: false
                })}
                {renderNavItem({
                  href: '/auth/simple-register',
                  label: 'Registrarse',
                  icon: UserPlus,
                  roles: ['all'],
                  requiresAuth: false
                })}
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium text-sm">Cerrar Sesión</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer móvil */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">LigaMaster SaaS v1.0</p>
        </div>
      </aside>

    </>
  );
}
