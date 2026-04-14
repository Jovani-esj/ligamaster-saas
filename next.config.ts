import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Deshabilitar middleware en modo de desarrollo si hay problemas
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // Configuración para manejar variables de entorno en middleware
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
};

export default nextConfig;
