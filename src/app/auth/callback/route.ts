import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if user has phone number in their user_metadata
      const { data: { session } } = await supabase.auth.getSession()
      
      // If user logs in via Google and has no phone number, redirect them to complete profile
      if (session && !session.user.user_metadata?.phone) {
        return NextResponse.redirect(`${origin}/auth/complete-profile`)
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Redirect to auth with error
  return NextResponse.redirect(`${origin}/auth?error=Could not authenticate`)
}
