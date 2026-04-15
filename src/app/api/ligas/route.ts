import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('API: Starting ligas fetch...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('API: Supabase URL:', supabaseUrl);
    console.log('API: Anon Key exists:', !!supabaseAnonKey);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('API: Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Missing Supabase configuration' }, 
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('API: Supabase client created');

    const { data, error } = await supabase
      .from('ligas')
      .select('*')
      .order('nombre_liga', { ascending: true });

    console.log('API: Query result - data:', data?.length || 0, 'error:', error);

    if (error) {
      console.error('API: Error fetching ligas:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leagues', details: error.message }, 
        { status: 500 }
      );
    }

    console.log('API: Success, returning data');
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Unexpected error', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
