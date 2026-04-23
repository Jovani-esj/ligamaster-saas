// src/lib/supabase-service.ts
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente con rol de servicio para bypass RLS (solo usar en servidor o para datos públicos)
// Si no hay service key, usar el cliente regular (con limitaciones de RLS)
export const supabaseService = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;
