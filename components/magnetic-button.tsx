'use client'

import { useRef, useCallback, type ReactNode, type MouseEvent } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: () => void
  variant?: 'primary' | 'outline'
}

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  onClick,
  variant = 'primary',
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current || !textRef.current) return

      const rect = buttonRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      gsap.to(buttonRef.current, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out',
      })

      gsap.to(textRef.current, {
        x: x * strength * 0.5,
        y: y * strength * 0.5,
        duration: 0.3,
        ease: 'power2.out',
      })
    },
    [strength]
  )

  const handleMouseLeave = useCallback(() => {
    if (!buttonRef.current || !textRef.current) return

    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    })

    gsap.to(textRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    })
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (!buttonRef.current) return

    gsap.to(buttonRef.current, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [])

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={cn(
        'magnetic-button relative overflow-hidden px-8 py-4 font-display text-lg uppercase tracking-wider rounded-full transition-colors duration-300',
        variant === 'primary' &&
          'bg-accent text-neutral-950 hover:bg-neutral-950 hover:text-accent',
        variant === 'outline' &&
          'border border-white bg-transparent text-white hover:bg-white hover:text-neutral-950',
        className
      )}
    >
      <span ref={textRef} className="relative z-10 block">
        {children}
      </span>
    </button>
  )
}
