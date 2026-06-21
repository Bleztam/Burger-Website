'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function CtaFooter() {
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const underlineRef = useRef<HTMLSpanElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const socialIconsRef = useRef<(HTMLAnchorElement | null)[]>([])


  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Social icon hover interactions - touch-friendly on mobile
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        socialIconsRef.current.forEach((icon) => {
          if (!icon) return

          icon.addEventListener('mouseenter', () => {
            gsap.to(icon, {
              y: -4,
              rotate: 8,
              duration: 0.2,
              ease: 'power1.out',
            })
          })

          icon.addEventListener('mouseleave', () => {
            gsap.to(icon, {
              y: 0,
              rotate: 0,
              duration: 0.2,
              ease: 'power1.out',
            })
          })
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Button hover handlers
  const handleButtonEnter = () => {
    if (!buttonRef.current) return
    gsap.to(buttonRef.current, {
      backgroundColor: '#171717',
      color: '#ffffff',
      duration: 0.3,
      ease: 'power2.inOut',
    })
  }

  const handleButtonLeave = () => {
    if (!buttonRef.current) return
    gsap.to(buttonRef.current, {
      backgroundColor: '#ffffff',
      color: '#dc2626',
      duration: 0.3,
      ease: 'power2.inOut',
    })
  }

  const handleOrderClick = () => {
    router.push('/order')
  }

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Upper CTA Banner - Yellow with halftone */}
      <div className="relative bg-amber-400 px-4 py-12 sm:px-6 sm:py-16 md:py-28">
        {/* Halftone overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '6px 6px',
          }}
        />

        {/* Graffiti watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span
            className="select-none whitespace-nowrap font-display text-[18vw] uppercase text-black/[0.03] sm:text-[15vw]"
            style={{
              transform: 'rotate(-8deg)',
            }}
          >
            THANK YOU
          </span>
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* CTA Heading */}
          <div ref={headingRef}>
            <h2 className="font-display text-2xl uppercase italic leading-tight text-neutral-900 sm:text-3xl md:text-6xl lg:text-7xl">
              A Place With
              <br />
              <span className="relative inline-block">
                Our DNA
                {/* Red paint strike underline */}
                <span
                  ref={underlineRef}
                  className="absolute -bottom-1 left-0 h-2 w-full sm:-bottom-2 sm:h-2.5 md:-bottom-3 md:h-4"
                  style={{
                    background: '#dc2626',
                    clipPath:
                      'polygon(0% 40%, 5% 20%, 10% 50%, 20% 30%, 30% 60%, 40% 25%, 50% 55%, 60% 35%, 70% 65%, 80% 30%, 90% 50%, 95% 25%, 100% 45%, 100% 100%, 0% 100%)',
                  }}
                />
              </span>
            </h2>
          </div>

          {/* Order Delivery Button */}
          <button
            ref={buttonRef}
            onClick={handleOrderClick}
            onMouseEnter={handleButtonEnter}
            onMouseLeave={handleButtonLeave}
            className="mt-6 rounded-full border-2 border-black bg-white px-6 py-2.5 font-display text-sm uppercase tracking-wide text-red-600 transition-transform hover:scale-105 sm:mt-8 sm:border-[2.5px] sm:px-10 sm:py-3 sm:text-base md:mt-14 md:border-[3px] md:px-14 md:py-5 md:text-xl"
          >
            Order Delivery
          </button>
        </div>
      </div>

      {/* Lower Red Footer Bar */}
      <footer className="relative border-t border-black bg-red-600 px-4 py-6 sm:px-6 md:py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 sm:gap-6 md:gap-8 md:flex-row md:justify-between">
          {/* Left - Address */}
          <p className="text-center font-display text-xs uppercase italic leading-tight text-white sm:text-sm md:text-left md:text-base">
            Dr. Flavio Zetola Street, 371
            <br />
            <span className="text-white/80 text-[11px] sm:text-xs md:text-sm">São José dos Pinhais</span>
          </p>

          {/* Center - IN-JOY Logo */}
          <div className="relative">
            <svg
              viewBox="0 0 200 60"
              className="h-10 w-auto sm:h-12 md:h-16"
              aria-label="IN-JOY"
            >
              {/* Bubble text outline effect */}
              <defs>
                <filter id="bubble-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="2" stdDeviation="0" floodColor="#000" floodOpacity="1" />
                </filter>
              </defs>
              
              {/* Main text with bubble outline */}
              <text
                x="100"
                y="45"
                textAnchor="middle"
                className="font-display"
                style={{
                  fontSize: '42px',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  fill: '#fbbf24',
                  stroke: '#000',
                  strokeWidth: 4,
                  paintOrder: 'stroke fill',
                  filter: 'url(#bubble-shadow)',
                }}
              >
                IN-JOY
              </text>

              {/* Mischievous face on the O */}
              <g transform="translate(128, 22)">
                {/* Left eye */}
                <ellipse cx="-4" cy="8" rx="3" ry="4" fill="#000" />
                {/* Right eye */}
                <ellipse cx="6" cy="8" rx="3" ry="4" fill="#000" />
                {/* Smirk */}
                <path
                  d="M -6 16 Q 1 22 8 16"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>

          {/* Right - Social Icons */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            {/* WhatsApp */}
            <a
              ref={(el) => { socialIconsRef.current[0] = el }}
              href="#"
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/80 transition-colors hover:border-white sm:h-9 sm:w-9 md:h-10 md:w-10"
              aria-label="WhatsApp"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              ref={(el) => { socialIconsRef.current[1] = el }}
              href="#"
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/80 transition-colors hover:border-white sm:h-9 sm:w-9 md:h-10 md:w-10"
              aria-label="Facebook"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              ref={(el) => { socialIconsRef.current[2] = el }}
              href="#"
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/80 transition-colors hover:border-white sm:h-9 sm:w-9 md:h-10 md:w-10"
              aria-label="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-4 text-center text-[10px] text-white/60 sm:mt-5 sm:text-xs">
          &copy; {new Date().getFullYear()} IN-JOY. All rights reserved.
        </p>
      </footer>
    </section>
  )
}
