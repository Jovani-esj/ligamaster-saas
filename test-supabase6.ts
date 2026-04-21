import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFK() {
  const { data, error } = await supabase
    .from('solicitudes_equipos')
    .insert([{
      liga_id: 'a0cc5967-0c7f-4b08-b7ab-893cfbb1dff6', // dummy
      nombre_equipo: 'Test Team',
      capitan_id: 'a0cc5967-0c7f-4b08-b7ab-893cfbb1dff6', // dummy
      estado: 'pendiente'
    }])
    .select();
  
  console.log('Result:', error || data);
}

checkFK();
