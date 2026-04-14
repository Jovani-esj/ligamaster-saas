import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Crear cliente de Supabase para el servidor
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Verificar si el usuario es SuperAdmin
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Verificar si el usuario tiene el rol de superadmin
    // Esto puede ser a través de metadata o una tabla separada
    const userMetadata = user.user_metadata;
    
    // Opción 1: Verificar en metadata del usuario
    if (userMetadata?.role === 'superadmin') {
      return true;
    }
    
    // Opción 2: Verificar en tabla de roles (más robusto)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'superadmin')
      .single();
    
    return !!roleData;
    
  } catch (error) {
    console.error('Error verificando rol de SuperAdmin:', error);
    return false;
  }
}

// Middleware para proteger rutas de SuperAdmin
export async function requireSuperAdmin() {
  const isAdmin = await isSuperAdmin();
  
  if (!isAdmin) {
    throw new Error('Acceso no autorizado. Se requieren permisos de SuperAdmin.');
  }
}

// Crear usuario SuperAdmin (función de utilidad)
export async function createSuperAdmin(email: string, password: string) {
  const supabase = createServerClient();
  
  try {
    // 1. Crear el usuario en auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'superadmin'
      }
    });
    
    if (authError) throw authError;
    
    // 2. Asignar rol en tabla user_roles (si se usa esa opción)
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([{
        user_id: authData.user?.id,
        role: 'superadmin'
      }]);
    
    if (roleError) throw roleError;
    
    return { success: true, user: authData.user };
    
  } catch (error) {
    console.error('Error creando SuperAdmin:', error);
    return { success: false, error };
  }
}
