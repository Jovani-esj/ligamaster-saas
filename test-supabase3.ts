import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data: cols, error } = await supabase.rpc('get_columns_for_table', { table_name: 'solicitudes_equipos' });
  console.log('Columns from RPC:', cols, error);
  
  // Alternative if RPC doesn't exist: use a postgrest direct fetch by trying to select all cols but limiting to 0, though we already tried limit 1 and got null because no rows exist.
  // We can just try an insert that fails on every column to see their names, or we can check typescript types if available.
}

checkSchema();
