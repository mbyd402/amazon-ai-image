import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PACKAGES } from '@/lib/config'

export async function middleware(request: NextRequest) {
  // Only run user creation on auth callback paths, not every dashboard/api request
  // This prevents slowdowns and timeouts on Vercel
  const path = request.nextUrl.pathname
  
  // Only need to check for new users after auth-related paths
  if (!path.includes('/dashboard') && !path.includes('/auth')) {
    return NextResponse.next()
  }

  // This middleware handles creating a user record in our table after OAuth login
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set, skipping user creation in middleware')
    return NextResponse.next()
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Get the access token from cookie
  const accessTokenName = `sb-${supabaseAnonKey.replace(/\./g, '-')}-auth-access-token`
  const accessToken = request.cookies.get(accessTokenName)?.value

  if (accessToken) {
    try {
      // Add timeout to prevent hanging on Vercel
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Middleware timeout')), 8000)
      })

      const userPromise = supabaseAdmin.auth.getUser(accessToken)
      const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any

      if (user) {
        // Check if user already exists - use maybeSingle to avoid errors
        const { data: existingUser } = await Promise.race([
          supabaseAdmin
            .from('users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle(),
          timeoutPromise
        ]) as any

        if (!existingUser) {
          console.log('Creating new user with free points:', PACKAGES.free.points);
          // Create user with free points - use upsert to avoid duplicate errors
          const { error } = await supabaseAdmin.from('users').upsert({
            id: user.id,
            email: user.email!,
            remaining_points: PACKAGES.free.points,
            total_points: PACKAGES.free.points,
            created_at: new Date().toISOString(),
          });
          if (error) {
            console.error('Create user error:', error);
          }
        }
      }
    } catch (err) {
      // Log error but don't block the request - let client handle it
      console.error('Middleware error:', err);
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
 
