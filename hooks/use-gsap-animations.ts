'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function useGsapAnimations() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Refresh ScrollTrigger after fonts load
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh()
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])
}

export function useTextReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const chars = element.querySelectorAll('.char')

    if (chars.length === 0) return

    gsap.set(chars, { y: '100%', opacity: 0 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'top 20%',
        toggleActions: 'play none none reverse',
      },
    })

    tl.to(chars, {
      y: '0%',
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.02,
    })

    return () => {
      tl.kill()
    }
  }, [ref])
}

export function useParallax(
  ref: React.RefObject<HTMLElement | null>,
  speed: number = 0.5
) {
  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    gsap.to(element, {
      y: () => speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })

    return () => {
      ScrollTrigger.getAll()
        .filter(t => t.vars.trigger === element)
        .forEach(t => t.kill())
    }
  }, [ref, speed])
}

export function useFadeInUp(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    gsap.set(element, { y: 60, opacity: 0 })

    gsap.to(element, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    })

    return () => {
      ScrollTrigger.getAll()
        .filter(t => t.vars.trigger === element)
        .forEach(t => t.kill())
    }
  }, [ref])
}
