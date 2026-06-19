'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function PromoSpotlight() {
  const sectionRef = useRef<HTMLElement>(null)
  const redBannerRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)
  const instagramRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Desktop animations
      mm.add('(min-width: 768px)', () => {
        // Red banner slides in from right
        gsap.fromTo(
          redBannerRef.current,
          { xPercent: 100 },
          {
            xPercent: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        // Location text reveals from bottom
        gsap.fromTo(
          locationRef.current,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        // Instagram handle reveals
        gsap.fromTo(
          instagramRef.current,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.6,
            delay: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        // Image scale reveal
        gsap.fromTo(
          imageRef.current,
          { scale: 1.1, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      // Mobile animations - lighter, performance-focused
      mm.add('(max-width: 767px)', () => {
        // Simple fade-in for banner
        gsap.fromTo(
          redBannerRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        // Simple fade-in for text
        gsap.fromTo(
          [locationRef.current, instagramRef.current],
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        // Simple fade-in for image
        gsap.fromTo(
          imageRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="promotions"
      className="relative min-h-[80vh] md:min-h-screen overflow-hidden bg-background py-12 md:py-0"
    >
      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Red accent banner - responsive sizing */}
      <div
        ref={redBannerRef}
        className="absolute right-0 top-0 z-10 h-16 w-full bg-red-600 sm:h-20 md:h-32 md:w-2/3 lg:w-1/2"
      >
        {/* Diagonal edge - hidden on mobile */}
        <div
          className="absolute -left-12 bottom-0 top-0 hidden w-24 bg-red-600 md:block"
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
        />
      </div>

      {/* Content container */}
      <div className="relative z-20 mx-auto flex h-full min-h-[80vh] max-w-screen-2xl flex-col px-4 sm:px-6 md:min-h-screen md:flex-row md:items-center md:px-8 lg:px-20">
        {/* Left side - Text info */}
        <div className="flex flex-col justify-center py-8 sm:py-10 md:w-1/2 md:py-0 md:pr-8 lg:pr-12">
          {/* Location */}
          <div className="overflow-hidden">
            <div ref={locationRef} className="mb-4 sm:mb-6 md:mb-8">
              <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:mb-2 sm:text-xs">
                Visit Us
              </span>
              <h2 className="font-display text-xl font-black uppercase leading-tight text-foreground sm:text-2xl md:text-3xl lg:text-4xl">
                R. Dr. Flávio Zetola, 371
              </h2>
              <p className="mt-1 text-base font-medium text-muted-foreground sm:text-lg md:text-xl">
                São José dos Pinhais
              </p>
            </div>
          </div>

          {/* Instagram handle */}
          <div className="overflow-hidden">
            <div ref={instagramRef} className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
                Follow
              </span>
              <a
                href="https://instagram.com/wolfs_"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1 sm:gap-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-foreground transition-colors group-hover:text-accent sm:h-5 sm:w-5"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span className="font-display text-lg font-black italic text-foreground transition-colors group-hover:text-accent sm:text-xl md:text-2xl lg:text-3xl">
                  @WOLFS_
                </span>
              </a>
            </div>
          </div>

          {/* Tagline */}
          <p className="mt-6 max-w-xs text-xs leading-relaxed text-muted-foreground sm:mt-8 sm:max-w-sm sm:text-sm md:mt-12 md:max-w-md md:text-base lg:text-lg">
            The authentic Brazilian street-style burger experience. Smashed
            fresh daily since 2015.
          </p>
        </div>

        {/* Right side - Image */}
        <div className="relative flex items-center justify-center md:w-1/2">
          <div
            ref={imageRef}
            className="relative aspect-square w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl"
          >
            {/* Red frame accent */}
            <div className="absolute -bottom-2 -right-2 h-full w-full border-2 border-red-600 sm:-bottom-3 sm:-right-3 sm:border-3 md:-bottom-6 md:-right-6 md:border-4" />

            {/* Image container */}
            <div className="relative h-full w-full overflow-hidden bg-secondary">
              <Image
                src="/images/grelhados-burger.webp"
                alt="180g Spotlight Burger - Premium grilled beef"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Badge overlay */}
            <div className="absolute -left-2 -top-2 z-10 sm:-left-3 sm:-top-3 md:-left-6 md:-top-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent sm:h-20 sm:w-20 md:h-28 md:w-28">
                <div className="text-center">
                  <span className="block font-display text-lg font-black text-background sm:text-xl md:text-3xl">
                    180g
                  </span>
                  <span className="block text-[7px] font-bold uppercase tracking-wider text-background sm:text-xs">
                    Beef
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
