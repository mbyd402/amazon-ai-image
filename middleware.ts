import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PACKAGES } from '@/lib/config'

export async function middleware(request: NextRequest) {
  // This middleware handles creating a user record in our table after OAuth login
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Create a response to return
  const response = NextResponse.next()

  // Get the access token from cookie
  const accessTokenName = `sb-${supabaseAnonKey}-auth-access-token`
  const refreshTokenName = `sb-${supabaseAnonKey}-auth-refresh-token`
  const accessToken = request.cookies.get(accessTokenName)?.value
  const refreshToken = request.cookies.get(refreshTokenName)?.value

  if (accessToken) {
    const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken)

    if (user) {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', user.id)

      console.log('Checking user exists:', user.id, user.email);
      if (!existingUser || existingUser.length === 0) {
        console.log('Creating new user with free points:', PACKAGES.free.points);
        // Create user with free points
        const { error } = await supabaseAdmin.from('users').insert({
          id: user.id,
          email: user.email!,
          remaining_points: PACKAGES.free.points,
          total_points: PACKAGES.free.points,
        });
        console.log('Create user result:', error);
      }

      // Don't refresh session in middleware to avoid lock conflicts
      // Cookie refresh handled by client side
      // We just need to create user record if not exists
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
 
