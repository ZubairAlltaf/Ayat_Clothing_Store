import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    // Ensure session is fresh
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect /asstories routes with strict RBAC
    if (request.nextUrl.pathname.startsWith('/asstories')) {
      if (!user) {
        // User is not logged in, redirect to login
        return NextResponse.redirect(new URL('/auth', request.url))
      }

      if (user.email === 'zubairalltafdev@gmail.com') {
        // Hardcode admin access for the main dev email
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile || profile.role !== 'admin') {
          // User is not an admin, redirect to home
          return NextResponse.redirect(new URL('/', request.url))
        }
      }
    }
  } catch (err) {
    // Missing credentials or Supabase error. 
    // If they try to access /asstories, block them since we can't verify auth.
    if (request.nextUrl.pathname.startsWith('/asstories')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}
