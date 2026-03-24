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
    
    // 🔐 For PKCE flow in Next.js App Router:
    // The code verifier is stored in localStorage on the client, not cookie.
    // So we can't do the exchange here. Instead, we just redirect to dashboard, client will handle it.
    // We just create the user record here if it doesn't exist using service_role.
    
    // Create service role client to create user record after exchange
    const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // After PKCE exchange completes on client, we need to get the user id
    // BUT we don't have the session here. So the client will create the user record if missing anyway.
    // Our client-side fallback in dashboard handles this.
    
    console.log(`🔀 Redirecting to ${next} after code received - client will complete PKCE exchange`)
    
    // Just redirect - client will handle the rest
    const response = NextResponse.redirect(`${origin}${next}`)
    return response
  }

  console.error('❌ No code found in OAuth callback')
  return NextResponse.redirect(`${origin}/login`)
}
