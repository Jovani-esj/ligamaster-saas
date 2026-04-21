'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Trophy, Settings, Home, LogOut, User, Users, MapPin, Calendar, CreditCard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/components/auth/SimpleAuthenticationSystem';

export default function SimpleNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useSimpleAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  // Verificar roles del usuario
  const isAdminLiga = user?.rol === 'admin_liga';
  const isCapitanEquipo = user?.rol === 'capitan_equipo';
  const isAdminAdmin = user?.rol === 'adminadmin';
  const isSuperAdmin = user?.rol === 'superadmin';
  const isAuthenticated = !!user;

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
            <Link 
              href="/" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </Link>
            
            <Link 
              href="/ligas" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Trophy className="h-4 w-4" />
              <span>Ligas</span>
            </Link>
            
            <Link 
              href="/roles-juego" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Roles de Juego</span>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </>
            ) : (
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
            )}

            {isAuthenticated && (
              <>
                {(isAdminLiga || isCapitanEquipo) && (
                  <Link 
                    href="/equipos" 
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Equipos</span>
                  </Link>
                )}
                
                {isCapitanEquipo && (
                  <Link 
                    href="/mi-equipo" 
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Mi Equipo</span>
                  </Link>
                )}

                {(!isAdminLiga && !isAdminAdmin && !isSuperAdmin) && (
                  <Link 
                    href="/mis-invitaciones" 
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Mis Invitaciones</span>
                  </Link>
                )}
                {isAdminLiga && (
                  <>
                    <Link 
                      href="/canchas" 
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>Canchas</span>
                    </Link>
                    
                    <Link 
                      href="/programacion-partidos" 
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Programación</span>
                    </Link>

                    <Link 
                      href="/suscripcion" 
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Suscripción</span>
                    </Link>
                  </>
                )}

                {(isAdminAdmin || isSuperAdmin) && (
                  <Link 
                    href="/admin-admin" 
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}

            {isAuthenticated && (
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
              <Link 
                href="/" 
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Inicio</span>
              </Link>
              
              <Link 
                href="/ligas" 
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <Trophy className="h-4 w-4" />
                <span>Ligas</span>
              </Link>
              
              <Link 
                href="/roles-juego" 
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <Calendar className="h-4 w-4" />
                <span>Roles de Juego</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/simple-login" 
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Iniciar Sesión</span>
                  </Link>
                  <Link 
                    href="/auth/simple-register" 
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Registrarse</span>
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  {(isAdminLiga || isCapitanEquipo) && (
                    <Link 
                      href="/equipos" 
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      <span>Equipos</span>
                    </Link>
                  )}
                  
                  {isAdminLiga && (
                    <>
                      <Link 
                        href="/canchas" 
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        onClick={() => setIsOpen(false)}
                      >
                        <MapPin className="h-4 w-4" />
                        <span>Canchas</span>
                      </Link>
                      
                      <Link 
                        href="/programacion-partidos" 
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        onClick={() => setIsOpen(false)}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Programación</span>
                      </Link>

                      <Link 
                        href="/suscripcion" 
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        onClick={() => setIsOpen(false)}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Suscripción</span>
                      </Link>
                    </>
                  )}
                </>
              )}

              {isAuthenticated && (isAdminAdmin || isSuperAdmin) && (
                <Link 
                  href="/admin-admin" 
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}

              {isAuthenticated && (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
