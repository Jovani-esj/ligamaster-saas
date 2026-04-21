import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testValidLiga() {
  const { data: liga } = await supabase.from('ligas').select('id').limit(1).single();
  if (!liga) return console.log('No ligas found');
  
  const { data, error } = await supabase
    .from('solicitudes_equipos')
    .insert([{
      liga_id: liga.id,
      nombre_equipo: 'Test Team',
      capitan_id: 'a0cc5967-0c7f-4b08-b7ab-893cfbb1dff6', // dummy, will likely fail FK
      estado: 'pendiente'
    }])
    .select();
  
  console.log('Result:', error || data);
}

testValidLiga();
