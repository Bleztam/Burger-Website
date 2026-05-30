'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

interface MarqueeDividerProps {
  text: string
  speed?: number
  direction?: 'left' | 'right'
  className?: string
}

export function MarqueeDivider({
  text,
  speed = 20,
  direction = 'left',
  className,
}: MarqueeDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!trackRef.current) return

    const track = trackRef.current
    const items = track.querySelectorAll('.marquee-item')
    if (items.length === 0) return

    const totalWidth = (items[0] as HTMLElement).offsetWidth

    gsap.set(track, { x: direction === 'left' ? 0 : -totalWidth })

    // Use matchMedia for mobile performance optimization
    const mm = gsap.matchMedia()
    let tl: gsap.core.Tween

    mm.add('(min-width: 768px)', () => {
      // Desktop - full speed
      tl = gsap.to(track, {
        x: direction === 'left' ? -totalWidth : 0,
        duration: speed,
        ease: 'none',
        repeat: -1,
      })
    })

    mm.add('(max-width: 767px)', () => {
      // Mobile - reduced speed to prevent blur on low-refresh displays
      tl = gsap.to(track, {
        x: direction === 'left' ? -totalWidth : 0,
        duration: speed * 1.5, // 50% slower on mobile
        ease: 'none',
        repeat: -1,
      })
    })

    return () => {
      if (tl) tl.kill()
      mm.revert()
    }
  }, [direction, speed])

  const repeatedText = Array(6).fill(text)

  return (
    <div
      ref={containerRef}
      className={cn(
        'overflow-hidden border-y border-border bg-secondary py-3 md:py-4',
        className
      )}
    >
      <div ref={trackRef} className="flex whitespace-nowrap">
        {repeatedText.map((t, i) => (
          <div key={i} className="marquee-item flex items-center gap-4 px-4 md:gap-8 md:px-8">
            <span className="font-display text-2xl uppercase tracking-wider text-foreground md:text-4xl lg:text-5xl">
              {t}
            </span>
            <span className="text-lg text-accent md:text-2xl">&#9679;</span>
          </div>
        ))}
      </div>
    </div>
  )
}
