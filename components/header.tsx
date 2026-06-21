'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import gsap from 'gsap'

const navLinks = [
  { label: 'PROMOTIONS', href: '/#promotions', isPromo: true },
  { label: 'Menu', href: '/#menu-section', isActive: true },
  { label: 'Branches', href: '/#branches' },
  { label: 'Combo', href: '/#combo' },
  { label: 'Track', href: '/track' },
]

import { useCart } from '@/components/cart-provider'

export function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const badgeRef = useRef<HTMLSpanElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { cartCount } = useCart()
  const { resolvedTheme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  useEffect(() => {
    // Cart badge pulse animation when items are added
    if (badgeRef.current && cartCount > 0) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 1 },
        {
          scale: 1.2,
          duration: 0.3,
          ease: 'power2.inOut',
          repeat: 3,
          yoyo: true,
        }
      )
    }
  }, [cartCount])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (mobileOpen) {
      setMobileOpen(false)
    }

    const [targetPath, hash] = href.split('#')
    const path = targetPath || '/'
    const anchor = hash ? `#${hash}` : ''

    if (!href.includes('#')) {
      return
    }

    if (path !== pathname) {
      e.preventDefault()
      router.push(`${path}${anchor}`)
      return
    }

    e.preventDefault()
    if (anchor) {
      const target = document.querySelector(anchor) as HTMLElement | null
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
  }

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30"
    >
      <div className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6 lg:px-12 max-w-screen-2xl mx-auto w-full">
        <div className="flex items-center gap-3 md:gap-6">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-md border border-border bg-card/80 p-2 text-foreground/80 transition-colors duration-200 hover:bg-secondary hover:text-foreground md:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="sr-only">Toggle menu</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative text-xs lg:text-sm font-medium tracking-wide transition-opacity duration-200 group whitespace-nowrap ${
                  link.isPromo
                    ? 'text-amber-500 hover:text-amber-400'
                    : link.isActive
                    ? 'text-foreground'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {link.label}
                {/* Active indicator */}
                {link.isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-500" />
                )}
                {/* Hover underline for non-active items */}
                {!link.isActive && !link.isPromo && (
                  <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-foreground/50 transition-all duration-300 group-hover:left-0 group-hover:w-full" />
                )}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Utilities */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Theme Toggle (replaces search) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="text-foreground/70 hover:text-foreground transition-colors duration-200 flex-shrink-0"
            aria-label={mounted ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'}
            title="Toggle theme"
          >
            {mounted && isDark ? (
              /* Sun — shown in dark mode to switch to light */
              <svg
                width="18"
                height="18"
                className="md:w-[22px] md:h-[22px] text-amber-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              /* Moon — shown in light mode to switch to dark */
              <svg
                width="18"
                height="18"
                className="md:w-[22px] md:h-[22px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>

          {/* User Profile Icon - hidden on mobile */}
          <button
            className="hidden md:flex text-foreground/70 hover:text-foreground transition-colors duration-200 flex-shrink-0"
            aria-label="User profile"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
          </button>

          {/* Shopping Bag Icon with Badge */}
          <Link
            href="/order"
            className="relative text-foreground/70 hover:text-foreground transition-colors duration-200 flex-shrink-0"
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <svg
              width="18"
              height="18"
              className="md:w-[22px] md:h-[22px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {/* Cart Badge */}
            {cartCount > 0 && (
              <span
                ref={badgeRef}
                className="absolute -bottom-2 -right-2 md:-bottom-1 md:-right-1 w-4 h-4 md:w-4 md:h-4 bg-amber-500 text-neutral-950 text-[8px] md:text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0"
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden bg-background/95 border-t border-border/30 transition-[max-height] duration-300 ${mobileOpen ? 'max-h-80' : 'max-h-0'}`}>
        <div className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-foreground/90 hover:bg-secondary hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  )
}
