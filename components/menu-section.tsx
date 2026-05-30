'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const burgers = [
  {
    name: 'Classic Smash',
    description: 'Double 60g smash patties, American cheese, house sauce.',
    price: 'R$ 28',
  },
  {
    name: 'The Monster Bacon',
    description: '180g grilled artisan patty, crispy smoked bacon sheets, cheddar cream.',
    price: 'R$ 38',
  },
  {
    name: 'Truffle Wolf',
    description: '180g beef patty, truffle mayo, caramelized onions, melted provolone.',
    price: 'R$ 42',
  },
  {
    name: 'Cheesy Jalapeño',
    description: 'Double smash, pickled jalapeños, spicy pepper jack cheddar injection.',
    price: 'R$ 34',
  },
  {
    name: 'Veggie Street',
    description: 'Plant-based crispy patty, shredded lettuce, fresh tomatoes, vegan garlic aioli.',
    price: 'R$ 32',
  },
]

const drinks = [
  {
    name: 'Craft IPA',
    description: 'Local artisanal craft IPA beer (served ice cold).',
    price: 'R$ 18',
  },
  {
    name: 'Classic Milkshake',
    description: 'Creamy vanilla bean base mixed with dark chocolate swirls.',
    price: 'R$ 22',
  },
  {
    name: 'Wolf Soda',
    description: 'House-infused craft soda with lime and guarana extract.',
    price: 'R$ 12',
  },
  {
    name: 'Passion Fruit Mocktail',
    description: 'Fresh passion fruit juice, sparkling water, mint sprigs.',
    price: 'R$ 16',
  },
  {
    name: 'Americano Iced Coffee',
    description: 'Double shot espresso poured over ice with a hint of caramel.',
    price: 'R$ 14',
  },
]

export function MenuSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const graffitiRef = useRef<HTMLDivElement>(null)
  const burgerItemsRef = useRef<HTMLDivElement>(null)
  const drinkItemsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Desktop animations
      mm.add('(min-width: 768px)', () => {
        // Graffiti parallax effect
        if (graffitiRef.current) {
          gsap.to(graffitiRef.current, {
            yPercent: -15,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          })
        }

        // Burger items slide in from left
        if (burgerItemsRef.current) {
          const burgerItems = burgerItemsRef.current.querySelectorAll('.menu-item')
          gsap.fromTo(
            burgerItems,
            { x: -50, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 60%',
              },
            }
          )
        }

        // Drink items slide in from right
        if (drinkItemsRef.current) {
          const drinkItems = drinkItemsRef.current.querySelectorAll('.menu-item')
          gsap.fromTo(
            drinkItems,
            { x: 50, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 60%',
              },
            }
          )
        }
      })

      // Mobile animations - simpler fade-in only
      mm.add('(max-width: 767px)', () => {
        // Simple fade for all items
        if (burgerItemsRef.current) {
          const burgerItems = burgerItemsRef.current.querySelectorAll('.menu-item')
          gsap.fromTo(
            burgerItems,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.05,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 70%',
              },
            }
          )
        }

        if (drinkItemsRef.current) {
          const drinkItems = drinkItemsRef.current.querySelectorAll('.menu-item')
          gsap.fromTo(
            drinkItems,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.05,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: drinkItemsRef.current,
                start: 'top 80%',
              },
            }
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="menu-section"
      className="relative overflow-hidden py-12 md:py-24 lg:py-32"
    >
      {/* Yellow Background Base */}
      <div className="absolute inset-0 bg-amber-400" />

      {/* Halftone Dot Grid Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
          backgroundSize: '8px 8px',
        }}
      />

      {/* Graffiti Watermark Layer with Parallax */}
      <div
        ref={graffitiRef}
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden"
      >
        <div className="absolute -rotate-12 opacity-[0.07]">
          <svg
            viewBox="0 0 800 400"
            className="h-auto w-[200vw] md:w-[150vw]"
            fill="currentColor"
          >
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-display font-black"
              style={{ fontSize: '120px', letterSpacing: '-0.02em' }}
            >
              THANK YOU
            </text>
            <text
              x="50%"
              y="75%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-display font-black"
              style={{ fontSize: '60px', letterSpacing: '0.1em' }}
            >
              FOR COMING
            </text>
            {/* Drip effects */}
            <path d="M180 230 Q185 280 180 320 Q175 340 180 360" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.6" />
            <path d="M320 240 Q325 290 320 350" stroke="currentColor" strokeWidth="6" fill="none" opacity="0.5" />
            <path d="M480 235 Q485 300 480 380" stroke="currentColor" strokeWidth="10" fill="none" opacity="0.7" />
            <path d="M620 230 Q625 260 620 310" stroke="currentColor" strokeWidth="5" fill="none" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-screen-xl px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mb-10 text-center sm:mb-12 md:mb-16 lg:mb-20">
          <span className="mb-2 inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-900/60 sm:mb-3 sm:text-xs md:mb-4 md:text-sm">
            Our Selection
          </span>
          <h2 className="font-display text-4xl font-black leading-none tracking-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl">
            THE MENU
          </h2>
        </div>

        {/* Two Column Grid - stacks on mobile */}
        <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 md:gap-12 lg:gap-16 xl:gap-24">
          {/* Burgers Column */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-black text-neutral-900 sm:mb-6 sm:gap-3 sm:text-2xl md:mb-8 md:gap-4 md:text-3xl lg:text-4xl">
              <span className="h-0.5 w-4 bg-neutral-900 sm:w-6 md:w-8" />
              BURGERS
            </h3>
            <div ref={burgerItemsRef} className="space-y-3 sm:space-y-4 md:space-y-6">
              {burgers.map((item, index) => (
                <div
                  key={index}
                  className="menu-item group cursor-pointer"
                >
                  <div className="flex flex-col gap-2 border-b-2 border-neutral-900/20 pb-3 transition-colors duration-300 group-hover:border-neutral-900 sm:gap-3 sm:pb-4 md:flex-row md:items-start md:justify-between md:gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-base font-bold text-neutral-900 transition-all duration-300 group-hover:tracking-wider sm:text-lg md:text-xl lg:text-2xl">
                        {item.name}
                      </h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-neutral-800/70 sm:mt-1 sm:text-sm md:text-base">
                        {item.description}
                      </p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap font-display text-sm font-bold text-neutral-900 sm:text-base md:text-lg lg:text-xl">
                      {item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drinks Column */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-black text-neutral-900 sm:mb-6 sm:gap-3 sm:text-2xl md:mb-8 md:gap-4 md:text-3xl lg:text-4xl">
              <span className="h-0.5 w-4 bg-neutral-900 sm:w-6 md:w-8" />
              DRINKS
            </h3>
            <div ref={drinkItemsRef} className="space-y-3 sm:space-y-4 md:space-y-6">
              {drinks.map((item, index) => (
                <div
                  key={index}
                  className="menu-item group cursor-pointer"
                >
                  <div className="flex flex-col gap-2 border-b-2 border-neutral-900/20 pb-3 transition-colors duration-300 group-hover:border-neutral-900 sm:gap-3 sm:pb-4 md:flex-row md:items-start md:justify-between md:gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-base font-bold text-neutral-900 transition-all duration-300 group-hover:tracking-wider sm:text-lg md:text-xl lg:text-2xl">
                        {item.name}
                      </h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-neutral-800/70 sm:mt-1 sm:text-sm md:text-base">
                        {item.description}
                      </p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap font-display text-sm font-bold text-neutral-900 sm:text-base md:text-lg lg:text-xl">
                      {item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
