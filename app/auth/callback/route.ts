import { NextResponse } from 'next/server'

// For implicit flow, the access_token is in the hash fragment
// We need to redirect back to login with the same hash so login can process it
export async function GET(request: Request) {
  const { href, search, hash } = new URL(request.url)
  const origin = process.env.NEXT_PUBLIC_APP_URL || href.split('/auth')[0]
  
  // Redirect to login, keep the hash (which contains the access_token)
  const redirectUrl = `${origin}/login${search}${hash}`
  console.log(`🔀 Implicit flow callback - redirecting to login with hash: ${hash.substring(0, 50)}...`)
  
  return NextResponse.redirect(redirectUrl)
}
