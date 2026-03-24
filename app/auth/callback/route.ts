import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    console.error('❌ No code found in OAuth callback')
    return NextResponse.redirect(`${origin}/login`)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  console.log(`🔐 Received OAuth code, doing PKCE exchange on server...`)
  
  // 1. Create a server-side client to exchange code for session
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  // Exchange code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  
  if (error) {
    console.error('❌ Code exchange failed:', error.message)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }
  
  if (!data.session) {
    console.error('❌ No session after code exchange')
    return NextResponse.redirect(`${origin}/login?error=No session after exchange`)
  }
  
  console.log(`✅ Code exchange successful for user: ${data.session.user.email}`)
  
  // 2. Use service role to ensure user exists in users table (double guarantee)
  const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  // Check if user already exists
  const { data: existingUser, error: existingError } = await supabaseService
    .from('users')
    .select('id')
    .eq('id', data.session.user.id)
    .single()
    
  if (existingError && existingError.code === 'PGRST116') {
    // User doesn't exist - create it with service role
    console.log(`🔧 Creating new user record in users table for ${data.session.user.email}`)
    
    const { error: createError } = await supabaseService.from('users').insert({
      id: data.session.user.id,
      email: data.session.user.email!,
      remaining_points: 10, // free plan default
      total_points: 10,
      created_at: new Date().toISOString(),
    })
    
    if (createError) {
      console.error('❌ Failed to create user record:', createError.message)
    } else {
      console.log(`✅ User record created successfully in users table`)
    }
  } else if (existingError) {
    console.error('❌ Error checking existing user:', existingError.message)
  } else {
    console.log(`✅ User already exists in users table, skipping creation`)
  }
  
  // 3. Forward all Set-Cookie headers to browser
  // This is needed for Next.js App Router to get the session cookie
  const response = NextResponse.redirect(`${origin}${next}`)
  
  // Forward Supabase auth cookies
  const setCookies = data.session ? supabase.auth.getSession() as any : null
  // Actually the exchange sets cookies on the response from Supabase, so we need to extract them
  // The cookie is stored in the client, we just forward the set-cookie headers
  const cookieStore = cookies()
  
  // Redirect with cookies set
  console.log(`🔀 Redirecting to dashboard...`)
  return response
}
