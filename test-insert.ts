import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase.from('partidos').insert([
    {
      liga_id: '00000000-0000-0000-0000-000000000000', // Un UUID dummy
      torneo_id: '00000000-0000-0000-0000-000000000000',
      estado: 'programado',
      marcador_local: 0,
      marcador_visitante: 0,
      duracion_minutos: 60
    }
  ]);
  console.log('Error:', error);
}

testInsert();
