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
    
    // 1. Use ANON key to exchange code - we need to manually set cookie
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Exchange code for session
    const { data, error } = await supabaseAnon.auth.exchangeCodeForSession(code)
    
    if (!error && data.session?.user) {
      console.log(`🔍 OAuth callback: Got session for ${data.session.user.email} (${data.session.user.id})`)
      
      // 2. Use SERVICE_ROLE key to create user record if not exists (bypass RLS)
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
    
    // 💥 CRITICAL - In Next.js 13+ App Router, we need to MANUALLY set the auth cookies
    // because Supabase doesn't propagate Set-Cookie headers to the final response
    const response = NextResponse.redirect(`${origin}${next}`)
    
    // For PKCE flow, after exchanging code, we need to get the cookie settings
    // Correct approach for Supabase >= 2.0:
    const { access_token, refresh_token, expires_in, expires_at } = data.session
    const now = Date.now()
    
    // Set access token cookie
    if (access_token) {
      response.cookies.set('sb-access-token', access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(now + expires_in * 1000),
      })
    }
    
    // Set refresh token cookie  
    if (refresh_token) {
      response.cookies.set('sb-refresh-token', refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(now + 1000 * 60 * 60 * 24 * 30), // 30 days
      })
    }
    
    return response
  }

  console.error('❌ No code found in OAuth callback')
  return NextResponse.redirect(`${origin}/login`)
}
