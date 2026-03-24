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
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session?.user) {
      // Check if user already exists in our users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.session.user.id)
        .single()
      
      // If user doesn't exist, create a new record with free points
      if (!existingUser) {
        console.log('Creating new user record for OAuth user:', data.session.user.email)
        await supabase.from('users').insert({
          id: data.session.user.id,
          email: data.session.user.email!,
          remaining_points: PACKAGES.free.points,
          total_points: PACKAGES.free.points,
          created_at: new Date().toISOString(),
        })
      }
    }
    
    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/login`)
}
