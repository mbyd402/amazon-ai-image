import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { PACKAGES } from '@/lib/config'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    // 🔑 Correct approach for Next.js 13+ App Router:
    // Pass all cookies from browser to Supabase client so it can get code verifier for PKCE
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    })
    
    // Exchange code for session - cookies already contain the code verifier
    const { data, error } = await supabaseAnon.auth.exchangeCodeForSession(code)
    
    if (!error && data.session?.user) {
      console.log(`🔍 OAuth callback: Got session for ${data.session.user.email} (${data.session.user.id})`)
      
      // ✅ Step 2: Use SERVICE_ROLE key to create user record if not exists (bypasses RLS)
      const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      // Check if user already exists in our users table
      const { data: existingUser, error: selectError } = await supabaseService
        .from('users')
        .select('id')
        .eq('id', data.session.user.id)
        .maybeSingle()
      
      if (selectError) {
        console.error('❌ Error checking existing user:', selectError.message)
      }
      
      // If user doesn't exist, create a new record with free points
      if (!existingUser) {
        console.log('✅ Creating new user record for OAuth user:', data.session.user.email)
        
        const { error: insertError } = await supabaseService.from('users').insert({
          id: data.session.user.id,
          email: data.session.user.email!,
          remaining_points: PACKAGES.free.points,
          total_points: PACKAGES.free.points,
          created_at: new Date().toISOString(),
        })
        
        if (insertError) {
          console.error('❌ Error creating user record:', insertError.message)
        } else {
          console.log('✅ User record created successfully by service_role')
        }
      } else {
        console.log('ℹ️ User already exists in users table, skipping creation')
      }
    } else if (error) {
      console.error('❌ Error exchanging code for session:', error.message)
    }
    
    // 💥 CRITICAL - In Next.js 13+ App Router, we need to forward ALL Set-Cookie headers
    const response = NextResponse.redirect(`${origin}${next}`)
    
    // Get all Set-Cookie headers from the response and forward them
    // Supabase auth already set the correct cookies after exchange
    const cookies = supabaseAnon.auth.getAllCookies()
    cookies.forEach(cookie => {
      response.headers.append('Set-Cookie', cookie)
    })
    
    return response
  }

  console.error('❌ No code found in OAuth callback')
  return NextResponse.redirect(`${origin}/login`)
}
