import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface TrackRequest {
  phone: string
  order_code: string
}

export async function POST(request: Request) {
  try {
    const { phone, order_code } = await request.json() as TrackRequest

    if (!phone || !order_code) {
      return NextResponse.json(
        { error: 'Phone number and order code are required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const normalizedCode = order_code.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    if (!normalizedCode) {
      return NextResponse.json(
        { error: 'Invalid order code provided.' },
        { status: 400 }
      )
    }

    // Some Postgres types (UUID) don't play nicely with ilike filters in all setups.
    // Query recent orders for the phone number and filter in JS for the partial code match.
    const { data, error } = await supabase
      .from('orders')
      .select(
        `id, customer_name, customer_phone, delivery_address, total_amount, status, created_at, order_items(id, quantity, menu_items(name))`
      )
      .eq('customer_phone', phone.trim())
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to query orders. Please try again.' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No orders found for that phone number.' },
        { status: 404 }
      )
    }

    // Find an order whose id contains the provided partial code
    const order = data.find((o: any) => (o.id || '').toLowerCase().includes(normalizedCode))

    if (!order) {
      return NextResponse.json(
        { error: 'No matching order found with that phone number and order code.' },
        { status: 404 }
      )
    }
    const tracking_code = (order.id || '').slice(-6).toUpperCase()

    return NextResponse.json({
      success: true,
      tracking_code,
      order: {
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        delivery_address: order.delivery_address,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          name: item.menu_items?.name || 'Item',
          quantity: item.quantity,
        })),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected error during order tracking.' },
      { status: 500 }
    )
  }
}
