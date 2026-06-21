'use client'

import { useState, useRef, useEffect } from 'react'
import { useCart } from '@/components/cart-provider'
import { Check, ArrowRight, RotateCcw, Flame, Sparkles, Smile, Coffee, Battery, ShieldAlert, Bot } from 'lucide-react'
import gsap from 'gsap'

export function AiFlavorPredictor() {
  const { addToCart } = useCart()
  const [step, setStep] = useState(1)
  
  // User selections
  const [mood, setMood] = useState('')
  const [craving, setCraving] = useState('')
  const [energy, setEnergy] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  const canProceedMood = mounted ? Boolean(mood) : false
  const canProceedCraving = mounted ? Boolean(craving) : false
  const canProceedEnergy = mounted ? Boolean(energy) : false

  // GSAP Animation refs
  const cardRef = useRef<HTMLDivElement>(null)
  const revealCardRef = useRef<HTMLDivElement>(null)

  const moods = [
    { name: 'adventurous', label: 'Adventurous 🌟', color: 'from-purple-500 to-indigo-600' },
    { name: 'energetic', label: 'Energetic ⚡', color: 'from-orange-500 to-red-600' },
    { name: 'stressed', label: 'Stressed 🤯', color: 'from-blue-500 to-cyan-600' },
    { name: 'chill', label: 'Chill 🍃', color: 'from-emerald-500 to-teal-600' },
  ]

  const cravings = [
    { name: 'savory', label: 'Strictly Savory 🥩', desc: 'Edgy salts, melted cheeses, bacon sheets.' },
    { name: 'balanced', label: 'Balanced Mix ⚖️', desc: 'Sweet sauces paired with savory beef patties.' },
    { name: 'sweet', label: 'Sweet Tooth 🍦', desc: 'Milkshakes, creams, and sweet drizzles.' },
  ]

  const energies = [
    { name: 'low', label: 'Low Battery 🔋', desc: 'Need a massive flavor injection to reboot.' },
    { name: 'steady', label: 'Steady State ⚡', desc: 'Cruising along, ready for standard satisfaction.' },
    { name: 'beast', label: 'Apex Beast 🦁', desc: 'High energy, ready to destroy a double patty!' },
  ]

  // Run once on hydration to avoid SSR/client mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Animate card entrance when step changes
  useEffect(() => {
    if (!cardRef.current) return
    gsap.fromTo(cardRef.current,
      { opacity: 0, x: 30, scale: 0.98 },
      { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: 'power3.out' }
    )
  }, [step])

  // Submit selections to API
  const handleCalculate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/predict-flavor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, craving, energy }),
      })
      const data = await response.json()
      if (data.success) {
        setRecommendation(data)
        setStep(4)
        
        // Custom 3D Reveal Flip animation for the result card
        setTimeout(() => {
          if (revealCardRef.current) {
            gsap.fromTo(revealCardRef.current,
              { opacity: 0, rotationY: -180, scale: 0.8, z: -100 },
              { opacity: 1, rotationY: 0, scale: 1, z: 0, duration: 0.8, ease: 'back.out(1.5)' }
            )
          }
        }, 50)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCombo = () => {
    if (!recommendation) return
    const { burger, drink } = recommendation
    
    // Add both to cart
    addToCart(burger.id, burger.name, Number(burger.price), 1)
    addToCart(drink.id, drink.name, Number(drink.price), 1)
    
    alert(`Added "${burger.name} + ${drink.name}" Combo to your Cart!`)
  }

  const handleReset = () => {
    setMood('')
    setCraving('')
    setEnergy('')
    setRecommendation(null)
    setStep(1)
  }

  return (
    <section id="combo" className="relative py-24 px-4 bg-background border-t border-b border-border overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl mx-auto text-center mb-10">
        <span className="text-amber-500 text-xs font-semibold uppercase tracking-[0.2em] mb-3 inline-block">
          Predictor Engine
        </span>
        <h2 className="font-display text-4xl uppercase text-foreground mb-4">
          AI FLAVOUR <span className="text-amber-500">PREDICTOR</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Ditch the decision paralysis. Let our advanced neural taste algorithm formulate your ultimate burger combo match.
        </p>
      </div>

      <div className="max-w-md mx-auto relative min-h-[350px]">
        {/* Progress Bar (Visible during quiz) */}
        {step < 4 && (
          <div className="w-full bg-card h-1.5 rounded-full mb-6 overflow-hidden relative">
            <div 
              className="bg-amber-500 h-full transition-all duration-300 rounded-full" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}

        {/* 1. QUIZ QUESTION STEPS */}
        {step < 4 && (
          <div 
            ref={cardRef}
            className="bg-card border border-border p-6 rounded-2xl shadow-2xl relative"
          >
            {/* Step 1: Mood Selector */}
            {step === 1 && (
              <div>
                <h3 className="font-display text-xl uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                  <Smile size={18} className="text-amber-500" />
                  1. Current Mood?
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {moods.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setMood(item.name)}
                      className={`p-4 rounded-xl border text-left transition-all duration-300 group cursor-pointer relative overflow-hidden ${
                        mood === item.name
                          ? 'border-amber-500 bg-secondary'
                          : 'border-border bg-background hover:border-foreground/30'
                      }`}
                    >
                      <span className="relative z-10 text-xs font-bold uppercase tracking-wider text-foreground/80">
                        {item.label}
                      </span>
                      {mood === item.name && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                          <Check size={10} className="text-black stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    disabled={!canProceedMood}
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-xs tracking-wider uppercase cursor-pointer"
                  >
                    Next Question <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Craving Selector */}
            {step === 2 && (
              <div>
                <h3 className="font-display text-xl uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                  <Coffee size={18} className="text-amber-500" />
                  2. Craving Style?
                </h3>
                <div className="space-y-3">
                  {cravings.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setCraving(item.name)}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-300 group cursor-pointer flex justify-between items-center ${
                        craving === item.name
                          ? 'border-amber-500 bg-secondary shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                          : 'border-border bg-background hover:border-foreground/30'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider block text-foreground mb-0.5">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                      </div>
                      {craving === item.name && (
                        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-black stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-xl border border-border hover:bg-secondary text-foreground/80 font-semibold text-xs tracking-wider uppercase cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    disabled={!canProceedCraving}
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-xs tracking-wider uppercase cursor-pointer"
                  >
                    Next Question <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Energy Meter */}
            {step === 3 && (
              <div>
                <h3 className="font-display text-xl uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                  <Battery size={18} className="text-amber-500" />
                  3. Energy Level?
                </h3>
                <div className="space-y-3">
                  {energies.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setEnergy(item.name)}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-300 group cursor-pointer flex justify-between items-center ${
                        energy === item.name
                          ? 'border-amber-500 bg-secondary shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                          : 'border-border bg-background hover:border-foreground/30'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider block text-foreground mb-0.5">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                      </div>
                      {energy === item.name && (
                        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-black stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl border border-border hover:bg-secondary text-foreground/80 font-semibold text-xs tracking-wider uppercase cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    disabled={!canProceedEnergy || loading}
                    onClick={handleCalculate}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-xs tracking-wider uppercase cursor-pointer relative overflow-hidden"
                  >
                    {loading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" />
                      </span>
                    ) : (
                      <>Formulate Combo <Sparkles size={14} /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. LOADING STATE COVER */}
        {loading && (
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center border border-border rounded-2xl">
            <Flame className="text-amber-500 animate-bounce mb-3" size={32} />
            <h4 className="font-display text-lg uppercase text-foreground tracking-wider">Taste Algorithm Processing...</h4>
            <p className="text-[10px] text-muted-foreground mt-1">Configuring protein/lipid coordinate pathways</p>
          </div>
        )}

        {/* 3. DYNAMIC 3D REVEAL COMBO CARD */}
        {step === 4 && recommendation && (
          <div 
            ref={revealCardRef}
            className="bg-card border-2 border-amber-500 p-6 rounded-2xl shadow-2xl relative flex flex-col items-center text-center opacity-0"
            style={{ perspective: 1000 }}
          >
            <div className="absolute -top-3.5 right-6 px-3 py-1 bg-amber-500 text-black text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
              <Sparkles size={10} /> Optimized Combo
            </div>

            <Bot className="text-amber-500 mb-3" size={32} />
            
            <h3 className="font-display text-2xl uppercase tracking-wider text-foreground mb-2 leading-none">
              {recommendation.burger.name} + {recommendation.drink.name}
            </h3>
            
            <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed bg-background/60 p-4 rounded-xl border border-border text-left italic">
              "{recommendation.explanation}"
            </p>

            {/* Split cards of combo details */}
            <div className="grid grid-cols-2 gap-3 w-full mb-6 text-left">
              <div className="bg-background border border-border p-3.5 rounded-xl">
                <span className="text-[9px] uppercase tracking-wider font-bold text-amber-500">Burger Match</span>
                <h4 className="font-display text-base uppercase text-foreground mt-1 truncate">{recommendation.burger.name}</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2 leading-normal">{recommendation.burger.description}</p>
                <span className="text-xs font-bold text-foreground mt-2 block">ETB {recommendation.burger.price}</span>
              </div>
              
              <div className="bg-background border border-border p-3.5 rounded-xl">
                <span className="text-[9px] uppercase tracking-wider font-bold text-amber-500">Drink Match</span>
                <h4 className="font-display text-base uppercase text-foreground mt-1 truncate">{recommendation.drink.name}</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2 leading-normal">{recommendation.drink.description}</p>
                <span className="text-xs font-bold text-foreground mt-2 block">ETB {recommendation.drink.price}</span>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={handleAddCombo}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-xs shadow-lg transition-transform duration-300 active:scale-95 cursor-pointer"
              >
                Add Entire Combo to Cart (ETB {Number(recommendation.burger.price) + Number(recommendation.drink.price)})
              </button>
              
              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-xl bg-background border border-border hover:bg-card text-muted-foreground font-semibold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={12} /> Retake Flavor Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
