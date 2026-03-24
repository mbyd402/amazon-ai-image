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
    
    // Use service_role to bypass RLS when inserting user record (server-side)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session?.user) {
      console.log(`🔍 OAuth callback: checking if user exists ${data.session.user.email} (${data.session.user.id})`)
      
      // Check if user already exists in our users table
      const { data: existingUser, error: selectError } = await supabase
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
        
        const { error: insertError } = await supabase.from('users').insert({
          id: data.session.user.id,
          email: data.session.user.email!,
          remaining_points: PACKAGES.free.points,
          total_points: PACKAGES.free.points,
          created_at: new Date().toISOString(),
        })
        
        if (insertError) {
          console.error('❌ Error creating user record:', insertError.message)
        } else {
          console.log('✅ User record created successfully')
        }
      } else {
        console.log('ℹ️ User already exists in users table, skipping creation')
      }
    } else if (error) {
      console.error('❌ Error exchanging code for session:', error.message)
    }
    
    return NextResponse.redirect(`${origin}${next}`)
  }

  console.error('❌ No code found in OAuth callback')
  return NextResponse.redirect(`${origin}/login`)
}
