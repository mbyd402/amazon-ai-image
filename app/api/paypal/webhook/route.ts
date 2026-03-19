import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PACKAGES } from '@/lib/config'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('paypal-transmission-sig') || ''
  const webhookId = process.env.PAYPAL_WEBHOOK_ID!

  // TODO: Verify webhook signature with PayPal
  // For MVP, we assume order is approved when user returns
  // Full verification can be added later

  try {
    const event = JSON.parse(body)
    
    if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const order = event.resource
      const orderId = order.id
      
      // Find our order and update it
      const { data: dbOrder } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('paypal_order_id', orderId)
        .single()

      if (dbOrder && dbOrder.status === 'pending') {
        // Update order status
        await supabaseAdmin
          .from('orders')
          .update({ status: 'completed' })
          .eq('id', dbOrder.id)

        // Add points to user
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('remaining_points, total_points')
          .eq('id', dbOrder.user_id)
          .single()

        if (user) {
          const pkg = PACKAGES[dbOrder.package_type as keyof typeof PACKAGES]
          await supabaseAdmin
            .from('users')
            .update({
              remaining_points: user.remaining_points + pkg.points,
              total_points: user.total_points + pkg.points,
            })
            .eq('id', dbOrder.user_id)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}
