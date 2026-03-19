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

      if (!existingUser || existingUser.length === 0) {
        // Create user with free points
        await supabaseAdmin.from('users').insert({
          id: user.id,
          email: user.email!,
          remaining_points: PACKAGES.free.points,
          total_points: PACKAGES.free.points,
        })
      }

      // Refresh the session to keep cookie fresh
      if (refreshToken) {
        const { data: { session } } = await supabaseAdmin.auth.refreshSession(refreshToken)
        if (session) {
          // Set the refreshed cookies
          const isSecure = process.env.NODE_ENV === 'production'
          response.cookies.set(accessTokenName, session.access_token!, {
            path: '/',
            httpOnly: true,
            secure: isSecure,
            sameSite: 'lax',
          })
          response.cookies.set(refreshTokenName, session.refresh_token!, {
            path: '/',
            httpOnly: true,
            secure: isSecure,
            sameSite: 'lax',
          })
        }
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
