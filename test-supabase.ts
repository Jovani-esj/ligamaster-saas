import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  // Test getInvitacionesPorEmail
  console.log('Testing getInvitacionesPorEmail...');
  const { data: invData, error: invError } = await supabase
    .from('invitaciones_capitanes')
    .select(`
      *,
      liga:ligas(id, nombre_liga, logo_url),
      equipo:equipos(id, nombre)
    `)
    .eq('email', 'test@test.com')
    .eq('estado', 'pendiente');
  
  if (invError) {
    console.error('getInvitacionesPorEmail Error:', invError);
  } else {
    console.log('getInvitacionesPorEmail Success:', invData);
  }

  // Test createSolicitudEquipo
  console.log('\nTesting createSolicitudEquipo...');
  const { data: solData, error: solError } = await supabase
    .from('solicitudes_equipos')
    .insert([{
      liga_id: '00000000-0000-0000-0000-000000000000', // Dummy
      user_profile_id: '00000000-0000-0000-0000-000000000000', // Dummy
      nombre_equipo: 'Test Team',
      mensaje: 'Hello',
      estado: 'pendiente'
    }])
    .select()
    .single();

  if (solError) {
    console.error('createSolicitudEquipo Error:', solError);
  } else {
    console.log('createSolicitudEquipo Success:', solData);
  }
}

testSupabase();
