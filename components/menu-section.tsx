'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/components/cart-provider'

gsap.registerPlugin(ScrollTrigger)

interface DBMenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  is_active: boolean
}

const fallbackMenuItems: DBMenuItem[] = [
  {
    id: 'f1',
    name: 'Classic Smash',
    description: 'Double 60g smash patties, American cheese, house sauce.',
    price: 28,
    category: 'burgers',
    is_active: true
  },
  {
    id: 'f2',
    name: 'The Monster Bacon',
    description: '180g grilled artisan patty, crispy smoked bacon sheets, cheddar cream.',
    price: 38,
    category: 'burgers',
    is_active: true
  },
  {
    id: 'f3',
    name: 'Truffle Wolf',
    description: '180g beef patty, truffle mayo, caramelized onions, melted provolone.',
    price: 42,
    category: 'burgers',
    is_active: true
  },
  {
    id: 'f4',
    name: 'Cheesy Jalapeño',
    description: 'Double smash, pickled jalapeños, spicy pepper jack cheddar injection.',
    price: 34,
    category: 'burgers',
    is_active: true
  },
  {
    id: 'f5',
    name: 'Veggie Street',
    description: 'Plant-based crispy patty, shredded lettuce, fresh tomatoes, vegan garlic aioli.',
    price: 32,
    category: 'burgers',
    is_active: true
  },
  {
    id: 'f6',
    name: 'Craft IPA',
    description: 'Local artisanal craft IPA beer (served ice cold).',
    price: 18,
    category: 'drinks',
    is_active: true
  },
  {
    id: 'f7',
    name: 'Classic Milkshake',
    description: 'Creamy vanilla bean base mixed with dark chocolate swirls.',
    price: 22,
    category: 'drinks',
    is_active: true
  },
  {
    id: 'f8',
    name: 'Wolf Soda',
    description: 'House-infused craft soda with lime and guarana extract.',
    price: 12,
    category: 'drinks',
    is_active: true
  },
  {
    id: 'f9',
    name: 'Passion Fruit Mocktail',
    description: 'Fresh passion fruit juice, sparkling water, mint sprigs.',
    price: 16,
    category: 'drinks',
    is_active: true
  },
  {
    id: 'f10',
    name: 'Americano Iced Coffee',
    description: 'Double shot espresso poured over ice with a hint of caramel.',
    price: 14,
    category: 'drinks',
    is_active: true
  }
]

export function MenuSection() {
  const [menuItems, setMenuItems] = useState<DBMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  const sectionRef = useRef<HTMLElement>(null)
  const graffitiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    async function loadMenu() {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_active', true)
        
        if (!error && data && data.length > 0) {
          setMenuItems(data)
        } else {
          setMenuItems(fallbackMenuItems)
        }
      } catch (err) {
        setMenuItems(fallbackMenuItems)
      } finally {
        setLoading(false)
      }
    }
    loadMenu()
  }, [])

  useEffect(() => {
    if (loading) return

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

        // Columns slide in - alternate left and right based on column index
        if (sectionRef.current) {
          const columns = sectionRef.current.querySelectorAll('.category-column')
          columns.forEach((col, colIdx) => {
            const items = col.querySelectorAll('.menu-item')
            const direction = colIdx % 2 === 0 ? -50 : 50
            gsap.fromTo(
              items,
              { x: direction, opacity: 0 },
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
          })
        }
      })

      // Mobile animations - simpler fade-in only
      mm.add('(max-width: 767px)', () => {
        if (sectionRef.current) {
          const columns = sectionRef.current.querySelectorAll('.category-column')
          columns.forEach((col) => {
            const items = col.querySelectorAll('.menu-item')
            gsap.fromTo(
              items,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.05,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: col,
                  start: 'top 80%',
                },
              }
            )
          })
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [loading])

  // Group menu items dynamically
  const categoriesMap: Record<string, DBMenuItem[]> = {}
  menuItems.forEach((item) => {
    const cat = item.category.toLowerCase()
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = []
    }
    categoriesMap[cat].push(item)
  })

  // Sort categories: burgers first, drinks second, then rest alphabetically
  const sortedCategories = Object.keys(categoriesMap).sort((a, b) => {
    if (a === 'burgers') return -1
    if (b === 'burgers') return 1
    if (a === 'drinks') return -1
    if (b === 'drinks') return 1
    return a.localeCompare(b)
  })

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

        {/* Dynamic Columns - stacks on mobile */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 md:gap-12 lg:gap-16 xl:gap-24">
            {sortedCategories.map((categoryName, colIdx) => {
              const items = categoriesMap[categoryName]
              return (
                <div key={categoryName} className="category-column">
                  <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-black text-neutral-900 sm:mb-6 sm:gap-3 sm:text-2xl md:mb-8 md:gap-4 md:text-3xl lg:text-4xl">
                    <span className="h-0.5 w-4 bg-neutral-900 sm:w-6 md:w-8" />
                    {categoryName.toUpperCase()}
                  </h3>
                  <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="menu-item group cursor-pointer"
                      >
                        <div className="flex flex-col gap-2 border-b-2 border-neutral-900/20 pb-3 transition-colors duration-300 group-hover:border-neutral-900 sm:gap-3 sm:pb-4">
                          <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-display text-base font-bold text-neutral-900 transition-all duration-300 group-hover:tracking-wider sm:text-lg md:text-xl lg:text-2xl">
                                {item.name}
                              </h4>
                              <p className="mt-0.5 text-xs leading-relaxed text-neutral-800/70 sm:mt-1 sm:text-sm md:text-base">
                                {item.description}
                              </p>
                            </div>
                            <span className="shrink-0 whitespace-nowrap font-display text-sm font-bold text-neutral-900 sm:text-base md:text-lg lg:text-xl">
                              ETB {Number(item.price)}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              addToCart(
                                item.id,
                                item.name,
                                Number(item.price),
                                1
                              )
                            }
                            className="w-full rounded-full bg-neutral-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-400 transition-all duration-300 hover:bg-neutral-800 hover:shadow-lg sm:w-auto md:text-sm"
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
