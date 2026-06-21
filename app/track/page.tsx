'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MagneticButton } from '@/components/magnetic-button'

const statusWorkflow = ['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const

type StatusWorkflow = (typeof statusWorkflow)[number]

export default function TrackPage() {
  const [phone, setPhone] = useState('')
  const [orderCode, setOrderCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [trackingCode, setTrackingCode] = useState('')

  const handleTrack = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!phone || !orderCode) {
      setStatus('error')
      setMessage('Please enter both phone number and order code.')
      return
    }

    setStatus('loading')
    setMessage('Looking up your order...')
    setOrder(null)

    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, order_code: orderCode }),
      })

      const data = await response.json()
      if (!response.ok) {
        setStatus('error')
        setMessage(data.error || 'Unable to lookup order.')
        return
      }

      setOrder(data.order)
      setTrackingCode(data.tracking_code || '')
      setStatus('success')
      setMessage(`Order ${data.tracking_code} found.`)
    } catch (error: any) {
      setStatus('error')
      setMessage(error?.message || 'Unexpected error while tracking order.')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Track Order</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Check your order status
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Enter your phone number and the simplified order code from your confirmation message.
            </p>
          </div>

          <Link
            href="/#menu-section"
            className="rounded-full border border-border bg-secondary px-5 py-3 text-sm font-semibold text-foreground transition hover:border-foreground hover:bg-secondary"
          >
            Back to menu
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-2xl shadow-black/20">
          <form onSubmit={handleTrack} className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground/80">
                Phone number
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20"
                  placeholder="+55 11 91234-5678"
                />
              </label>

              <label className="block text-sm font-medium text-foreground/80">
                Order code
                <input
                  value={orderCode}
                  onChange={(event) => setOrderCode(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20"
                  placeholder="e.g. A1B2C3"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <MagneticButton variant="primary" type="submit">
                {status === 'loading' ? 'Checking…' : 'Track order'}
              </MagneticButton>
              {status !== 'idle' && (
                <p className={`text-sm ${status === 'success' ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                  {message}
                </p>
              )}
            </div>
          </form>

          {order && (
            <div className="mt-10 rounded-3xl border border-border bg-secondary p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-400">Current status</p>
                  <h2 className="mt-2 text-3xl font-black text-foreground">{order.status.replace(/_/g, ' ')}</h2>
                </div>
                <div className="rounded-3xl bg-background px-4 py-3 text-xs uppercase tracking-[0.25em] text-amber-600 dark:text-amber-300">
                  Code: {trackingCode ? trackingCode.toUpperCase() : orderCode.toUpperCase()}
                </div>
              </div>

              <div className="mt-8">
                <div className="grid gap-3 sm:grid-cols-4">
                  {statusWorkflow.map((step) => {
                    const stepIndex = statusWorkflow.indexOf(step)
                    const activeIndex = statusWorkflow.indexOf(order.status as StatusWorkflow)
                    const isActive = stepIndex <= activeIndex
                    return (
                      <div
                        key={step}
                        className={`rounded-3xl border p-4 text-center transition-all duration-300 ${
                          isActive
                            ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-200'
                            : 'border-border bg-background text-muted-foreground'
                        }`}
                      >
                        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                          {step.replace(/_/g, ' ')}
                        </p>
                        <p className="mt-3 text-sm font-bold uppercase">
                          {isActive ? '✔' : '—'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border bg-muted p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Customer</p>
                  <p className="mt-2 text-sm text-foreground">{order.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                </div>
                <div className="rounded-3xl border border-border bg-muted p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Delivery address</p>
                  <p className="mt-2 text-sm text-foreground">{order.delivery_address}</p>
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-border bg-muted p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Order items</p>
                <ul className="mt-4 space-y-3">
                  {order.items.map((item: any) => (
                    <li key={item.id} className="flex items-center justify-between text-sm text-foreground/80">
                      <span>{item.name}</span>
                      <span className="font-semibold text-foreground">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
