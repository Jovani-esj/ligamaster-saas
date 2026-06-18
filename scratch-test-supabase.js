const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('Parsing .env.local manually...');
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    // remove quotes if any
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', url);
console.log('Anon Key exists:', !!anonKey, anonKey ? anonKey.substring(0, 15) + '...' : '');
console.log('Service Key exists:', !!serviceKey, serviceKey ? serviceKey.substring(0, 15) + '...' : '');

async function test() {
  if (anonKey) {
    try {
      const supabaseAnon = createClient(url, anonKey);
      const { data, error } = await supabaseAnon.from('ligas').select('*').limit(1);
      console.log('Anon Key Test Result:', { success: !error, error });
    } catch (e) {
      console.log('Anon Key Test Threw:', e.message);
    }
  }

  if (serviceKey) {
    try {
      const supabaseService = createClient(url, serviceKey);
      const { data, error } = await supabaseService.from('ligas').select('*').limit(1);
      console.log('Service Key Test Result:', { success: !error, error });
    } catch (e) {
      console.log('Service Key Test Threw:', e.message);
    }
  }
}

test();
