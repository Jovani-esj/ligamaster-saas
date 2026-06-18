import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let cachedServerClient: any = null;

export async function getSupabaseServerClient() {
  if (cachedServerClient) return cachedServerClient;

  const options = {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  };

  if (!serviceKey) {
    cachedServerClient = createClient(supabaseUrl, anonKey, options);
    return cachedServerClient;
  }

  const serviceClient = createClient(supabaseUrl, serviceKey, options);
  try {
    const { error } = await serviceClient.from('ligas').select('id').limit(1);
    if (error && error.message.includes('Invalid API key')) {
      console.warn('supabaseServer: SUPABASE_SERVICE_ROLE_KEY es inválida. Usando clave anónima (anon key)...');
      cachedServerClient = createClient(supabaseUrl, anonKey, options);
    } else {
      cachedServerClient = serviceClient;
    }
  } catch (err) {
    cachedServerClient = createClient(supabaseUrl, anonKey, options);
  }
  return cachedServerClient;
}

export const supabaseServer = createClient(supabaseUrl, serviceKey || anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

