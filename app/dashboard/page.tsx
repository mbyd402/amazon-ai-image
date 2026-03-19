import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardContentClient from './DashboardContentClient'

// This is a server component - fetches data on the server, avoids client network issues
export default async function DashboardPage() {
  // Create server-side Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Get auth token from cookies
  const cookieStore = cookies()
  const accessTokenName = `sb-${supabaseAnonKey.replace(/\./g, '-')}-auth-access-token`
  const accessToken = cookieStore.get(accessTokenName)?.value

  if (!accessToken) {
    redirect('/login')
  }

  // Get user
  let user
  try {
    const { data } = await supabase.auth.getUser(accessToken)
    user = data.user
  } catch (err) {
    console.error('Server-side get user error:', err)
    redirect('/login')
  }

  if (!user) {
    redirect('/login')
  }

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('remaining_points, total_points')
    .eq('id', user.id)
    .single()

  return <DashboardContentClient user={user} userData={userData} />
}
