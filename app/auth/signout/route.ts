import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  // Check if we have a session
  const { data: { session }, error } = await supabase.auth.getSession();

  if (session) {
    // Sign out user if session exists
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error('Error signing out:', signOutError);
      return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
    }
  }

  // Redirect to login page
  const redirectUrl = new URL('/login', process.env.FRONTEND_URL).toString();
  return NextResponse.redirect(redirectUrl);
}
