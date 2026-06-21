'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function GrelhadosSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const textLeftRef = useRef<HTMLDivElement>(null)
  const textRightRef = useRef<HTMLDivElement>(null)
  const burgerRef = useRef<HTMLDivElement>(null)
  const stickerARef = useRef<HTMLDivElement>(null)
  const stickerBRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const badgeTextRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Text reveal animation - same for all devices
      const textTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      })

      textTl
        .fromTo(
          textLeftRef.current,
          { scale: 0.8, rotate: -3, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }
        )
        .fromTo(
          textRightRef.current,
          { scale: 0.8, rotate: 3, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' },
          '-=0.4'
        )

      // Desktop animations
      mm.add('(min-width: 768px)', () => {
        // Burger parallax
        gsap.to(burgerRef.current, {
          y: -80,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })

        // Floating sticker A (Yeah Fresh) - vertical float
        gsap.to(stickerARef.current, {
          y: 8,
          duration: 3,
          yoyo: true,
          repeat: -1,
          ease: 'power1.inOut',
        })

        // Floating sticker B (Flame) - rotation tilt
        gsap.to(stickerBRef.current, {
          rotate: 5,
          duration: 2.5,
          yoyo: true,
          repeat: -1,
          ease: 'power1.inOut',
        })
      })

      // Mobile - disable heavy animations
      mm.add('(max-width: 767px)', () => {
        // Simple fade instead of parallax
        gsap.fromTo(
          burgerRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      // Rotating badge text - same for all but slower on mobile
      mm.add('(min-width: 768px)', () => {
        gsap.to(badgeTextRef.current, {
          rotate: 360,
          duration: 12,
          repeat: -1,
          ease: 'none',
        })
      })

      mm.add('(max-width: 767px)', () => {
        gsap.to(badgeTextRef.current, {
          rotate: 360,
          duration: 20, // slower on mobile
          repeat: -1,
          ease: 'none',
        })
      })

      // Badge entrance
      gsap.fromTo(
        badgeRef.current,
        { scale: 0, rotate: -180 },
        {
          scale: 1,
          rotate: 0,
          duration: 0.8,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[80vh] overflow-hidden bg-red-50 dark:bg-red-600 py-12 sm:py-16 md:min-h-screen md:py-20 transition-colors duration-500"
    >
      {/* Halftone dot pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.4) 1px, transparent 1px)`,
          backgroundSize: '8px 8px',
        }}
      />

      {/* Graffiti/tag overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50' y='200' font-family='sans-serif' font-size='120' font-weight='900' fill='%23000' transform='rotate(-15 200 200)'%3EWOLFS%3C/text%3E%3C/svg%3E")`,
          backgroundSize: '500px 500px',
        }}
      />

      {/* Auxiliary tags - responsive sizing */}
      <div className="absolute left-2 top-14 z-10 sm:left-4 sm:top-16 md:left-8 md:top-24">
        <span className="inline-block -rotate-6 rounded bg-black/80 px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-wider text-white sm:px-2.5 sm:text-[9px] md:px-3 md:text-xs lg:text-sm">
          180 Gram Burger
        </span>
      </div>
      <div className="absolute bottom-14 right-2 z-10 sm:bottom-16 sm:right-4 md:bottom-24 md:right-8">
        <span className="inline-block rotate-3 rounded bg-black/80 px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-wider text-white sm:px-2.5 sm:text-[9px] md:px-3 md:text-xs lg:text-sm">
          The Perfect Point
        </span>
      </div>

      {/* Main typography - GRE- */}
      <div
        ref={textLeftRef}
        className="absolute left-0 top-1/4 z-20 -translate-y-1/2 sm:top-1/3 md:top-1/3"
      >
        <h2
          className="font-display text-[18vw] font-black uppercase leading-none text-red-700 dark:text-white sm:text-[16vw] md:text-[18vw]"
          style={{
            textShadow: '4px 4px 0 rgba(0,0,0,0.3)',
            WebkitTextStroke: '2px rgba(0,0,0,0.1)',
          }}
        >
          GRE-
        </h2>
      </div>

      {/* Main typography - LHADOS */}
      <div
        ref={textRightRef}
        className="absolute bottom-1/4 right-0 z-20 translate-y-1/2 sm:bottom-1/3 md:bottom-1/3"
      >
        <h2
          className="font-display text-[18vw] font-black uppercase leading-none text-red-700 dark:text-white sm:text-[16vw] md:text-[18vw]"
          style={{
            textShadow: '4px 4px 0 rgba(0,0,0,0.3)',
            WebkitTextStroke: '2px rgba(0,0,0,0.1)',
          }}
        >
          LHADOS
        </h2>
      </div>

      {/* Center burger image */}
      <div
        ref={burgerRef}
        className="absolute left-1/2 top-1/2 z-30 w-[65vw] max-w-xs -translate-x-1/2 -translate-y-1/2 sm:w-[75vw] sm:max-w-sm md:w-[70vw] md:max-w-2xl"
      >
        <Image
          src="/images/grelhados-burger.webp"
          alt="180 gram grilled burger"
          width={800}
          height={800}
          className="h-auto w-full drop-shadow-2xl"
          priority
        />
      </div>

      {/* Sticker A - Yeah Fresh tag - hidden on mobile */}
      <div
        ref={stickerARef}
        className="absolute bottom-[35%] left-[8%] z-40 hidden md:block md:left-[20%] lg:bottom-[40%]"
        style={{ transform: 'translateY(-8px)' }}
      >
        <div className="relative -rotate-12">
          <div className="rounded-lg bg-amber-400 px-4 py-2 shadow-lg">
            <span className="font-display text-lg font-black uppercase text-black md:text-2xl">
              Yeah Fresh!
            </span>
          </div>
          {/* Tape effect */}
          <div className="absolute -right-2 -top-2 h-6 w-12 rotate-45 bg-white/60" />
        </div>
      </div>

      {/* Sticker B - Flame icon - hidden on mobile */}
      <div
        ref={stickerBRef}
        className="absolute right-[8%] top-[30%] z-40 hidden md:block md:right-[20%] lg:top-[35%]"
        style={{ transform: 'rotate(-5deg)' }}
      >
        <div className="relative rotate-12">
          <svg
            viewBox="0 0 64 64"
            className="h-16 w-16 drop-shadow-lg md:h-24 md:w-24"
          >
            <circle cx="32" cy="32" r="30" fill="#000" />
            <path
              d="M32 12c0 0-12 10-12 24 0 8 5 14 12 14s12-6 12-14c0-14-12-24-12-24zm0 32c-4 0-6-3-6-8 0-6 4-12 6-15 2 3 6 9 6 15 0 5-2 8-6 8z"
              fill="#F59E0B"
            />
            <path
              d="M32 36c-2 0-3-1.5-3-4 0-3 2-6 3-7.5 1 1.5 3 4.5 3 7.5 0 2.5-1 4-3 4z"
              fill="#FCD34D"
            />
          </svg>
          {/* Tape effect */}
          <div className="absolute -bottom-1 -left-2 h-5 w-10 -rotate-12 bg-white/60" />
        </div>
      </div>

      {/* Rotating PEDIR WOLFS badge */}
      <div
        ref={badgeRef}
        className="absolute bottom-4 right-2 z-50 h-16 w-16 sm:bottom-6 sm:right-4 md:bottom-12 md:right-12 md:h-32 md:w-32"
      >
        <div className="relative h-full w-full">
          {/* Rotating text ring */}
          <svg
            ref={badgeTextRef}
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <path
                id="circlePath"
                d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
              />
            </defs>
            <circle cx="50" cy="50" r="48" fill="#000" />
            <text
              fill="#F59E0B"
              fontSize="10"
              fontWeight="bold"
              letterSpacing="2"
            >
              <textPath href="#circlePath">
                PEDIR WOLFS * PEDIR WOLFS * PEDIR WOLFS *
              </textPath>
            </text>
          </svg>

          {/* Center flame face */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="h-8 w-8 sm:h-10 sm:w-10 md:h-16 md:w-16">
              <path
                d="M20 4c0 0-10 8-10 20 0 6.5 4 11.5 10 11.5s10-5 10-11.5c0-12-10-20-10-20z"
                fill="#F59E0B"
              />
              <path
                d="M20 14c0 0-5 4-5 10 0 3.5 2 6 5 6s5-2.5 5-6c0-6-5-10-5-10z"
                fill="#FCD34D"
              />
              {/* Face */}
              <circle cx="17" cy="22" r="1.5" fill="#000" />
              <circle cx="23" cy="22" r="1.5" fill="#000" />
              <path
                d="M16 27 Q20 30 24 27"
                stroke="#000"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
