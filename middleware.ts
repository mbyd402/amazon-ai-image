import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Remove the automatic user creation in middleware - this was causing too many service_role requests
// User creation will happen on first login from client side
export async function middleware(request: NextRequest) {
  // Just pass through, don't do any service_role Supabase requests
  // This avoids triggering Supabase's rate limits/风控
  return NextResponse.next()
}

export const config = {
  matcher: [], // Don't match any routes - completely disable middleware
}
