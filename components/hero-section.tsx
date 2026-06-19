'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { MagneticButton } from './magnetic-button'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function HeroSection() {
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  const titleLinesRef = useRef<(HTMLElement | null)[]>([])
  const imageRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Initialize all elements off-screen
      titleLinesRef.current.forEach((el) => {
        if (el) gsap.set(el, { yPercent: 100, opacity: 0 })
      })
      gsap.set(imageRef.current, { x: 100, opacity: 0 })
      gsap.set(subtitleRef.current, { opacity: 0, y: 30 })
      gsap.set(ctaRef.current, { opacity: 0, y: 30 })
      gsap.set(scrollIndicatorRef.current, { opacity: 0, y: 20 })

      // Split-screen entrance timeline
      const tl = gsap.timeline({ delay: 0.2 })

      // Step 1: Typography stagger reveal
      tl.to(
        titleLinesRef.current.filter((el) => el !== null),
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: 'power4.out',
          stagger: 0.15,
        },
        0
      )

      // Step 2: Image slides from right (overlapped)
      tl.to(
        imageRef.current,
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
        },
        0.1 // Slight overlap with text reveal
      )

      // Step 3: Subtitle and CTA fade in
      tl.to(
        subtitleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
        },
        0.5
      )

      tl.to(
        ctaRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
        },
        0.6
      )

      tl.to(
        scrollIndicatorRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
        },
        0.7
      )

      // Desktop - parallax animations
      mm.add('(min-width: 768px)', () => {
        gsap.to(imageRef.current, {
          y: -100,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })

        // Text parallax (subtle)
        gsap.to('.hero-content', {
          y: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })
      })

      // Mobile - disable parallax, use simple fade
      mm.add('(max-width: 767px)', () => {
        gsap.to(imageRef.current, {
          opacity: 0.6,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom center',
            scrub: 1,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[75vh] items-center justify-start overflow-hidden px-4 py-10 md:min-h-screen md:px-8 md:py-20"
    >
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />

      {/* Transparent cutout chef + burger image - positioned absolutely */}
      <div
        ref={imageRef}
        className="pointer-events-none relative z-10 mx-auto mb-8 w-full max-w-[240px] md:absolute md:right-0 md:top-1/2 md:mx-0 md:mb-0 md:w-[45vw] md:max-w-[550px] md:-translate-y-1/2"
      >
        <Image
          src="/images/chef-burger-cutout.jpg"
          alt="Chef holding triple smash burger"
          width={600}
          height={800}
          priority
          className="h-auto w-full object-contain drop-shadow-2xl"
        />
      </div>

      {/* Content wrapper */}
      <div className="hero-content relative z-20 flex flex-col gap-4 max-w-2xl md:gap-8">
        {/* Split title lines with stagger reveal */}
        <h1 className="font-display uppercase leading-[0.9] md:leading-[0.85] tracking-tight text-[12vw] sm:text-[11vw] md:text-[10vw] lg:text-[9vw]">
          <span
            ref={(el) => {
              if (el) titleLinesRef.current[0] = el
            }}
            className="block text-foreground overflow-hidden"
          >
            Smash
          </span>
          <span
            ref={(el) => {
              if (el) titleLinesRef.current[1] = el
            }}
            className="block text-accent overflow-hidden"
          >
            Burger
          </span>
          <span
            ref={(el) => {
              if (el) titleLinesRef.current[2] = el
            }}
            className="block text-foreground overflow-hidden"
          >
            Culture
          </span>
        </h1>

        {/* Spacer and subtitle with proper constraints */}
        <div className="min-h-2 md:min-h-4" />

        <p
          ref={subtitleRef}
          className="max-w-xs sm:max-w-sm md:max-w-md text-sm sm:text-base md:text-lg lg:text-xl text-white/70 leading-relaxed"
        >
          Authentic Brazilian street-style burgers. Smashed to perfection, loaded with flavor.
        </p>

        {/* CTA button cluster */}
        <div
          ref={ctaRef}
          className="flex flex-wrap gap-2 sm:gap-3 items-center md:gap-4 pt-2"
        >
          <MagneticButton variant="primary" onClick={() => router.push('/order')}>
            Order Now
          </MagneticButton>
          <MagneticButton
            variant="outline"
            onClick={() =>
              document
                .getElementById('menu-section')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            View Menu
          </MagneticButton>
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 md:bottom-10 left-1/2 hidden -translate-x-1/2 md:block"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Scroll
          </span>
          <div className="h-12 w-px bg-gradient-to-b from-muted-foreground to-transparent" />
        </div>
      </div>
    </section>
  )
}
