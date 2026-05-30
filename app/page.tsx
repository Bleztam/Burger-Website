'use client'

import { useGsapAnimations } from '@/hooks/use-gsap-animations'
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { MarqueeDivider } from '@/components/marquee-divider'
import { ProductSection } from '@/components/product-section'
import { MenuSection } from '@/components/menu-section'
import { AiFlavorPredictor } from '@/components/ai-flavor-predictor'
import { PromoSpotlight } from '@/components/promo-spotlight'
import { RoadmapSection } from '@/components/roadmap-section'
import { GrelhadosSection } from '@/components/grelhados-section'
import { CtaFooter } from '@/components/cta-footer'

export default function Home() {
  useGsapAnimations()

  return (
    <>
      <Header />
      
      <main className="relative min-h-screen overflow-x-hidden pt-16">
        <HeroSection />

        <MarqueeDivider
          text="Smashed Fresh Daily"
          speed={25}
          direction="left"
        />

        <ProductSection
          subtitle="The Original"
          title="Classic Smash"
          accentWord="Smash"
          description="Two thin patties smashed on a scorching hot griddle until crispy. Topped with melted American cheese, pickles, onions, and our secret sauce. The burger that started it all."
          imageSrc="/images/smash-burger.webp"
          imageAlt="Classic smash burger with melted cheese and pickles"
        />

        <MarqueeDivider
          text="Grilled to Perfection"
          speed={30}
          direction="right"
        />

        <ProductSection
          subtitle="For the Purists"
          title="Traditional Beef"
          accentWord="Beef"
          description="A thick, juicy patty cooked medium on the grill. Simple, honest, delicious. Lettuce, tomato, onion, and mayo on a brioche bun. Sometimes classic is best."
          imageSrc="/images/traditional-burger.webp"
          imageAlt="Traditional grilled beef burger with fresh vegetables"
          reverse
        />

        <MarqueeDivider
          text="Check the Menu"
          speed={20}
          direction="left"
        />

        <MenuSection />

        <AiFlavorPredictor />

        <PromoSpotlight />

        <MarqueeDivider
          text="Find Your Spot"
          speed={20}
          direction="right"
        />

        <RoadmapSection />

        <MarqueeDivider
          text="Na Brasa"
          speed={25}
          direction="left"
        />

        <GrelhadosSection />

        <CtaFooter />
      </main>
    </>
  )
}

