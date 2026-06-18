const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, anonKey);

async function check() {
  console.log('Checking usuarios_simple columns...');
  const { data: uData, error: uError } = await supabase.from('usuarios_simple').select('id, liga_id').limit(1);
  if (uError) {
    console.error('Error querying usuarios_simple:', uError);
  } else {
    console.log('usuarios_simple query success:', uData);
  }

  console.log('Checking partidos columns...');
  const { data: pData, error: pError } = await supabase.from('partidos').select('id, arbitro_id').limit(1);
  if (pError) {
    console.error('Error querying partidos:', pError);
  } else {
    console.log('partidos query success:', pData);
  }
}

check();
