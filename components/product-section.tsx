'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ProductSectionProps {
  title: string
  subtitle: string
  description: string
  imageSrc: string
  imageAlt: string
  reverse?: boolean
  accentWord?: string
}

export function ProductSection({
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt,
  reverse = false,
  accentWord,
}: ProductSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Image parallax and reveal
      gsap.set(imageRef.current, { opacity: 0, x: reverse ? -100 : 100 })
      gsap.set(contentRef.current, { opacity: 0, y: 60 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        },
      })

      // Desktop: full animations with parallax
      mm.add('(min-width: 768px)', () => {
        tl.to(imageRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
        }).to(
          contentRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.4'
        )

        // Parallax effect on desktop only
        gsap.to(imageRef.current, {
          y: reverse ? 50 : -50,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        })
      })

      // Mobile: simpler animations
      mm.add('(max-width: 767px)', () => {
        tl.to(imageRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power3.out',
        }).to(
          contentRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
          },
          '-=0.3'
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] overflow-hidden bg-background py-12 md:min-h-screen md:py-0"
    >
      <div className={cn(
        'flex h-full flex-col items-center justify-center gap-6 px-4 py-16 md:flex-row md:gap-8 md:px-8 md:py-0 lg:gap-12 lg:px-20',
        reverse && 'md:flex-row-reverse'
      )}>
        {/* Image container */}
        <div
          ref={imageRef}
          className="flex w-full flex-shrink-0 items-center justify-center md:w-1/2"
        >
          <div className="relative aspect-square w-full max-w-sm md:max-w-lg lg:max-w-xl">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Content container */}
        <div
          ref={contentRef}
          className="flex w-full flex-col justify-center gap-4 md:w-1/2 md:gap-6 lg:gap-8"
        >
          {/* Subtitle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-accent md:text-sm">
              {subtitle}
            </span>
            <span className="h-px flex-1 bg-accent/30" />
          </div>

          {/* Title */}
          <h2
            ref={titleRef}
            className="font-display text-4xl font-black uppercase leading-[1] text-foreground sm:text-5xl md:text-5xl lg:text-6xl"
          >
            {title.split(' ').map((word, idx) => (
              <span
                key={idx}
                className={word === accentWord ? 'text-accent' : ''}
              >
                {word}{' '}
              </span>
            ))}
          </h2>

          {/* Description */}
          <p className="max-w-md text-sm leading-relaxed text-white/70 sm:text-base md:text-lg">
            {description}
          </p>

          {/* CTA */}
          <div className="pt-2">
            <button className="rounded-full border border-accent/50 px-6 py-2 text-sm font-medium text-accent transition-all duration-300 hover:border-accent hover:bg-accent/10 md:px-8 md:py-3 md:text-base">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
