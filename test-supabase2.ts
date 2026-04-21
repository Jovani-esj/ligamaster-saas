import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data: ligas, error: err1 } = await supabase.from('ligas').select('*').limit(1);
  console.log('Ligas columns:', ligas && ligas[0] ? Object.keys(ligas[0]) : err1);

  const { data: solicitudes, error: err2 } = await supabase.from('solicitudes_equipos').select('*').limit(1);
  console.log('Solicitudes columns:', solicitudes && solicitudes[0] ? Object.keys(solicitudes[0]) : err2);
  
  if (!solicitudes || solicitudes.length === 0) {
    // Attempt an insert to force the error and see if we can guess the columns
    const { error: err3 } = await supabase.from('solicitudes_equipos').insert([{}]).select();
    console.log('Solicitudes insert error:', err3);
  }
}

checkSchema();
