import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('usuarios_simple')
      .select('count')
      .single();

    // Test user query
    const { data: userTest, error: userError } = await supabase
      .from('usuarios_simple')
      .select('*')
      .eq('email', 'mindostech@gmail.com')
      .eq('activo', true)
      .single();

    // Test all users
    const { data: allUsers, error: allUsersError } = await supabase
      .from('usuarios_simple')
      .select('email, nombre, rol, activo')
      .limit(5);

    return NextResponse.json({
      success: true,
      connection: {
        test: connectionTest,
        error: connectionError
      },
      userQuery: {
        user: userTest,
        error: userError
      },
      allUsers: {
        users: allUsers,
        error: allUsersError
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
