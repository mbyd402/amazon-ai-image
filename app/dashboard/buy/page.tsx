'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { supabase } from '@/lib/supabase.ts'
import { PACKAGES, type PackageType } from '@/lib/config.ts'

export default function BuyPoints() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processingOrder, setProcessingOrder] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const createOrder = async (packageType: PackageType) => {
    const pkg = PACKAGES[packageType]
    return pkg.price.toString()
  }

  const onApprove = async (packageType: PackageType, orderId: string) => {
    setProcessingOrder(true)
    
    const pkg = PACKAGES[packageType]
    
    // Create order in database
    const { error: orderError } = await supabase.from('orders').insert({
      user_id: user.id,
      package_type: packageType,
      points_added: pkg.points,
      amount: pkg.price,
      currency: 'USD',
      paypal_order_id: orderId,
      status: 'completed',
    })

    if (orderError) {
      console.error('Error creating order:', orderError)
      setProcessingOrder(false)
      return
    }

    // Update user points
    const { data: currentUser } = await supabase
      .from('users')
      .select('remaining_points, total_points')
      .eq('id', user.id)
      .single()

    if (currentUser) {
      await supabase.from('users').update({
        remaining_points: currentUser.remaining_points + pkg.points,
        total_points: currentUser.total_points + pkg.points,
      }).eq('id', user.id)
    }

    setProcessingOrder(false)
    router.push('/dashboard')
    router.refresh()
  }

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Buy More Image Points
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Points never expire. Choose a package that fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {(Object.keys(PACKAGES) as PackageType[]).map((key) => {
            const pkg = PACKAGES[key]
            if (key === 'free') return null
            return (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-700 relative"
              >
                {key === 'standard' && (
                  <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Popular
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {pkg.name}
                </h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${pkg.price}
                  </span>
                </div>
                <ul className="mt-6 space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-gray-500 dark:text-gray-300">
                      {pkg.points} image points
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-gray-500 dark:text-gray-300">
                      Points never expire
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-gray-500 dark:text-gray-300">
                      All core features
                    </span>
                  </li>
                </ul>

                <PayPalScriptProvider options={{ clientId }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', shape: 'rect' }}
                    createOrder={() => createOrder(key)}
                    onApprove={(data) => onApprove(key, data.orderID)}
                    disabled={processingOrder}
                  />
                </PayPalScriptProvider>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
