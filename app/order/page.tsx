'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MagneticButton } from '@/components/magnetic-button'
import { useCart } from '@/components/cart-provider'

export default function OrderPage() {
  const router = useRouter()
  const { cart, cartTotal, clearCart } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [trackingCode, setTrackingCode] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (cart.length === 0) {
      setStatus('error')
      setMessage('Your cart is empty. Add items from the menu first.')
      return
    }

    if (!customerName || !customerPhone || !deliveryAddress) {
      setStatus('error')
      setMessage('Please provide your name, phone, and delivery address.')
      return
    }

    setStatus('loading')
    setMessage('Submitting your order...')

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: deliveryAddress,
          cart,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus('error')
        setMessage(data.error || 'Unable to submit order. Please try again.')
        return
      }

      clearCart()
      setStatus('success')
      setTrackingCode(data.order_code || '')
      setMessage(
        `Order placed successfully! Your tracking code is ${data.order_code}. Use it with your phone number to check status.`
      )
    } catch (error: any) {
      setStatus('error')
      setMessage(error?.message || 'An unexpected error occurred.')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Order Now</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Quick anonymous checkout
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Enter your details and submit your order without logging in. Admin staff can process orders from the dashboard after they arrive.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-border bg-secondary px-5 py-3 text-sm font-semibold text-foreground transition hover:border-foreground hover:bg-secondary"
            >
              Back to homepage
            </Link>
            <Link
              href="/#menu-section"
              className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300"
            >
              Browse menu
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-2xl shadow-black/20">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Your order</h2>
            {cart.length === 0 ? (
              <div className="space-y-4 rounded-3xl border border-dashed border-border bg-secondary p-8 text-center text-muted-foreground">
                <p className="text-lg font-semibold text-foreground">Your cart is empty.</p>
                <p>Add items from the menu and return here to complete your order.</p>
                <Link
                  href="/#menu-section"
                  className="inline-flex rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-neutral-950"
                >
                  Browse the menu
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="rounded-3xl bg-muted p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-foreground">ETB {item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-3xl border border-border bg-secondary p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Order total</span>
                    <span className="font-semibold text-foreground">ETB {cartTotal}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-2xl shadow-black/20">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Checkout details</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-medium text-foreground/80">
                Full name
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20"
                  placeholder="Your name"
                />
              </label>

              <label className="block text-sm font-medium text-foreground/80">
                Phone number
                <input
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20"
                  placeholder="+55 11 91234-5678"
                />
              </label>

              <label className="block text-sm font-medium text-foreground/80">
                Delivery address
                <textarea
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20"
                  placeholder="Street, number, neighborhood, city"
                />
              </label>

              <div className="flex items-center justify-between gap-4">
                <MagneticButton variant="primary" type="submit">
                  {status === 'loading' ? 'Submitting...' : 'Submit Order'}
                </MagneticButton>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerName('')
                    setCustomerPhone('')
                    setDeliveryAddress('')
                    setTrackingCode('')
                    setStatus('idle')
                    setMessage('')
                  }}
                  className="inline-flex items-center justify-center rounded-3xl border border-border bg-secondary px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  Reset
                </button>
              </div>

              {message ? (
                <p
                  className={`rounded-3xl border px-4 py-3 text-sm ${
                    status === 'success'
                      ? 'border-emerald-500/40 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200'
                      : 'border-rose-500/30 bg-rose-400/10 text-rose-700 dark:text-rose-100'
                  }`}
                >
                  {message}
                </p>
              ) : null}
            </form>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-secondary p-6 text-sm text-muted-foreground">
            <p>
              Note: orders are submitted anonymously without authentication. The admin dashboard will receive live order updates and can process orders from the PENDING queue.
            </p>
          </div>
          {trackingCode ? (
            <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-700 dark:text-amber-100">
              <p className="font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-200 text-xs mb-2">Your tracking code</p>
              <p className="text-lg font-bold text-foreground">{trackingCode}</p>
              <p className="mt-3 text-foreground/80">
                Use this code with your phone number at the
                <Link href="/track" className="text-amber-600 dark:text-amber-300 underline ml-1">
                  track order page
                </Link>
                .
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
