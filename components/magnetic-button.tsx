'use client'

import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'primary' | 'outline'
  type?: 'button' | 'submit' | 'reset'
}

export function MagneticButton({
  children,
  className,
  onClick,
  variant = 'primary',
  type = 'button',
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      className={cn(
        'magnetic-button relative overflow-hidden px-8 py-4 font-display text-lg uppercase tracking-wider rounded-full transition duration-300 will-change-transform hover:scale-[1.03] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-amber-500/70',
        variant === 'primary' &&
          'bg-accent text-accent-foreground hover:bg-foreground hover:text-accent',
        variant === 'outline' &&
          'border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background',
        className
      )}
    >
      <span className="relative z-10 block">{children}</span>
    </button>
  )
}
