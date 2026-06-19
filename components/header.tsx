'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
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
  const { cartCount } = useCart()
  const router = useRouter()
  const pathname = usePathname()

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
      className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-sm border-b border-border/30"
    >
      <div className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6 lg:px-12 max-w-screen-2xl mx-auto w-full">
        {/* Left/Center Navigation - Hidden on mobile, shown on desktop */}
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
                  ? 'text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {link.label}
              {/* Active indicator */}
              {link.isActive && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-amber-500" />
              )}
              {/* Hover underline for non-active items */}
              {!link.isActive && !link.isPromo && (
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white/50 transition-all duration-300 group-hover:left-0 group-hover:w-full" />
              )}
            </a>
          ))}
        </nav>

        {/* Mobile menu indicator - shown on mobile */}
        <div className="md:hidden text-white/70 text-xs font-medium tracking-wide">
          MENU
        </div>

        {/* Right Utilities */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Search Icon */}
          <button
            className="text-white/70 hover:text-white transition-colors duration-200 flex-shrink-0"
            aria-label="Search"
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          {/* User Profile Icon - hidden on mobile */}
          <button
            className="hidden md:flex text-white/70 hover:text-white transition-colors duration-200 flex-shrink-0"
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
            className="relative text-white/70 hover:text-white transition-colors duration-200 flex-shrink-0"
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
    </header>
  )
}
