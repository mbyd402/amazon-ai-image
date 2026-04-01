import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 🎯 Node.js Runtime for Cloudflare Workers (supports sharp)
export const runtime = 'nodejs'

// 🔧 Force dynamic rendering - fixes "Dynamic server usage" error on Vercel
export const dynamic = 'force-dynamic'

// 测试接口：测试点数扣减逻辑
// GET /api/test-points?userId=xxx
// 不调用第三方API，只测试数据库扣减是否正常

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing userId parameter',
        help: 'Call /api/test-points?userId=your-user-id'
      }, { status: 400 })
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Get current points
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, remaining_points, processed_count')
      .eq('id', userId)
      .single()

    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: 'Fetch failed',
        details: fetchError.message,
        code: fetchError.code
      }, { status: 500 })
    }

    console.log('Current user data before deduction:', currentUser)

    // 2. Deduct 1 point - same logic as production
    const pointsToDeduct = 1
    const newRemainingPoints = Math.max(0, (currentUser.remaining_points || 0) - pointsToDeduct)
    const newProcessedCount = (currentUser.processed_count || 0) + 1

    console.log('Deduction:', {
      before: currentUser.remaining_points,
      after: newRemainingPoints,
      deduct: pointsToDeduct
    })

    // 3. Update database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        remaining_points: newRemainingPoints,
        processed_count: newProcessedCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: 'Update failed',
        details: updateError.message,
        code: updateError.code
      }, { status: 500 })
    }

    // 4. Verify the update
    const { data: updatedUser, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('id, remaining_points, processed_count')
      .eq('id', userId)
      .single()

    if (verifyError) {
      return NextResponse.json({
        success: false,
        error: 'Verify failed',
        details: verifyError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Points deduction test completed',
      test: {
        userId,
        pointsToDeduct: 1,
        before: {
          remaining_points: currentUser.remaining_points,
          processed_count: currentUser.processed_count
        },
        after: {
          remaining_points: updatedUser.remaining_points,
          processed_count: updatedUser.processed_count
        }
      },
      matches: updatedUser.remaining_points === newRemainingPoints
    })

  } catch (error: any) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 })
  }
}
