import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This is a one-off admin route to add points for testing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: Request) {
  try {
    // Find user by email
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, remaining_points, total_points')
      .eq('email', 'mbyd402@gmail.com')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users[0]
    const addPoints = 100 - (user.remaining_points || 0)
    
    // Update to 100 points
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        remaining_points: 100,
        total_points: (user.total_points || 0) + addPoints,
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Updated user ${user.email} to ${100} remaining points`,
      user: { ...user, remaining_points: 100 }
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
