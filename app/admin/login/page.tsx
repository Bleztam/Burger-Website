'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, Eye, EyeOff, Lock, Mail, Terminal } from 'lucide-react'
import gsap from 'gsap'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  const router = useRouter()
  const loginCardRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Custom visual reveal entrance
  useEffect(() => {
    if (loginCardRef.current) {
      gsap.fromTo(loginCardRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.5)' }
      )
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        router.push('/admin/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setErrorMsg('An unexpected authentication error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Login Container Card */}
      <div
        ref={loginCardRef}
        className="w-full max-w-md bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden shadow-2xl p-8 relative opacity-0"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-3 shadow-lg animate-pulse">
            <Shield size={24} />
          </div>
          <h2 className="font-display text-2xl uppercase tracking-wider text-neutral-100">
            WOLFSBURGER <span className="text-amber-500">ADMIN</span>
          </h2>
          <p className="text-xs text-neutral-450 mt-1">Authorized Restaurant Operator Console</p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex items-start gap-2.5">
            <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={16} />
            <span className="text-xs text-red-200">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                <Mail size={14} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@wolfsburger.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-neutral-600"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Password Key
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                <Lock size={14} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-neutral-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-350 cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold uppercase tracking-wider text-xs shadow-lg transition-all duration-300 active:scale-[0.98] mt-6 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading ? 'Decrypting Session...' : 'Authenticate'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-850 flex items-center justify-center gap-1.5 text-[10px] text-neutral-550 uppercase tracking-widest">
          <Terminal size={10} /> console.operator.v1.0
        </div>
      </div>
    </main>
  )
}

function ShieldAlert(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}
