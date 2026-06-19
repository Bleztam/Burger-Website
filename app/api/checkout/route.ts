import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CartItem {
  id: string // menu_item id
  quantity: number
  price: number
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { customer_name, customer_phone, delivery_address, cart } = await request.json()

    if (!customer_name || !customer_phone || !delivery_address || !cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: 'Missing required checkout information.' },
        { status: 400 }
      )
    }

    // 1. Recalculate total server-side to prevent client tampering
    // Fetch prices from DB to verify
    const menuIds = cart.map((item: CartItem) => item.id)
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, price')
      .in('id', menuIds)

    if (menuError || !menuItems) {
      return NextResponse.json(
        { error: 'Failed to retrieve menu items for validation.' },
        { status: 500 }
      )
    }

    const priceMap = new Map<string, number>()
    menuItems.forEach((item) => priceMap.set(item.id, Number(item.price)))

    let totalAmount = 0
    const orderItemsToInsert: Array<{ menu_item_id: string; quantity: number }> = []

    for (const item of cart as CartItem[]) {
      const dbPrice = priceMap.get(item.id)
      if (dbPrice === undefined) {
        return NextResponse.json(
          { error: `Menu item with id ${item.id} not found.` },
          { status: 400 }
        )
      }
      totalAmount += dbPrice * item.quantity
      orderItemsToInsert.push({
        menu_item_id: item.id,
        quantity: item.quantity,
      })
    }

    // 2. Insert Order into 'orders' table
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name,
        customer_phone,
        delivery_address,
        total_amount: totalAmount,
        status: 'PENDING',
      })
      .select('id')
      .single()

    if (orderError || !orderData) {
      return NextResponse.json(
        { error: `Order creation failed: ${orderError?.message}` },
        { status: 500 }
      )
    }

    const orderId = orderData.id

    // 3. Insert Order Items linked to Order ID
    const orderItemsWithId = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: orderId,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithId)

    if (itemsError) {
      // Clean up the order if items fail to insert (atomic consistency simulation)
      await supabase.from('orders').delete().eq('id', orderId)
      return NextResponse.json(
        { error: `Failed to insert order items: ${itemsError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order_id: orderId,
      order_code: orderId.slice(-6).toUpperCase(),
      total_amount: totalAmount,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
