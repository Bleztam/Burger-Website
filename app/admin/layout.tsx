'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, LogOut, LayoutDashboard, Store, Menu, X, User } from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [operatorEmail, setOperatorEmail] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setOperatorEmail(user.email || 'operator@wolfscrew.com')
      }
    }
    getSession()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-250 flex flex-col font-sans">
      {/* Back-office Operator Navbar */}
      <header className="bg-neutral-900 border-b border-neutral-850 px-4 md:px-8 py-4 relative z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-bold">
              <Shield size={16} />
            </div>
            <Link href="/admin/dashboard">
              <span className="font-display text-lg uppercase tracking-wider text-white">
                Wolfsburger <span className="text-amber-500">BackOffice</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/admin/dashboard" 
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-500 hover:text-amber-400"
            >
              <LayoutDashboard size={14} /> Operations Console
            </Link>
            <Link 
              href="/" 
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-200"
            >
              <Store size={14} /> Main Storefront
            </Link>
          </nav>

          {/* Operator Action Info Panel */}
          <div className="hidden md:flex items-center gap-4">
            {operatorEmail && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-955 border border-neutral-800 text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                <User size={12} className="text-amber-500" /> {operatorEmail.split('@')[0]}
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold uppercase tracking-wider text-[10px] transition-colors border border-red-500/20 cursor-pointer"
            >
              <LogOut size={12} /> Exit Session
            </button>
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-neutral-800 text-neutral-200"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-neutral-900 border-b border-neutral-800 p-4 space-y-4 shadow-xl z-30">
            <nav className="flex flex-col gap-3">
              <Link 
                href="/admin/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500"
              >
                <LayoutDashboard size={14} /> Operations Console
              </Link>
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-450"
              >
                <Store size={14} /> Main Storefront
              </Link>
            </nav>
            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              {operatorEmail && (
                <span className="text-[10px] text-neutral-450 uppercase font-bold">{operatorEmail}</span>
              )}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600/10 text-red-500 text-[10px] font-bold uppercase"
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Back-office Body contents */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {children}
      </div>
    </div>
  )
}
