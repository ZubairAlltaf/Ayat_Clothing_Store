import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // We must use the Service Role Key to bypass RLS and interact with the admin auth API
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user exists by listing users matching the email
    // This requires service_role key
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error('Supabase Admin Auth Error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const userExists = users.some((user) => user.email === email)

    return NextResponse.json({ exists: userExists })
  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
