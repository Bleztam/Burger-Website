'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createClient } from '@/lib/supabase/client'

gsap.registerPlugin(ScrollTrigger)

interface DBBranch {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  status: 'UNLOCKED' | 'LOCKED'
  step_order: number
  hours: string
}

// Full premium fallback data matching original visual timeline design
const staticFallbackBranches: DBBranch[] = [
  {
    id: 1,
    name: 'São José dos Pinhais',
    address: 'Rua XV de Novembro, 1234',
    latitude: -25.5349,
    longitude: -49.2008,
    status: 'UNLOCKED',
    step_order: 1,
    hours: 'Tue-Sun: 6PM - 11PM',
  },
  {
    id: 2,
    name: 'Curitiba Centro',
    address: 'Av. Marechal Deodoro, 567',
    latitude: -25.4284,
    longitude: -49.2733,
    status: 'UNLOCKED',
    step_order: 2,
    hours: 'Mon-Sun: 5PM - 12AM',
  },
  {
    id: 3,
    name: 'Batel',
    address: 'Rua Bispo Dom José, 890',
    latitude: -25.4431,
    longitude: -49.2922,
    status: 'UNLOCKED',
    step_order: 3,
    hours: 'Wed-Sun: 6PM - 11PM',
  },
  {
    id: 4,
    name: 'Água Verde',
    address: 'Coming Soon',
    latitude: -25.4518,
    longitude: -49.2854,
    status: 'LOCKED',
    step_order: 4,
    hours: 'Opening Q2 2026',
  },
  {
    id: 5,
    name: 'Santa Felicidade',
    address: 'Coming Soon',
    latitude: -25.4055,
    longitude: -49.3308,
    status: 'LOCKED',
    step_order: 5,
    hours: 'Opening Q4 2026',
  },
]

export function RoadmapSection() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const isDarkModeRef = useRef(isDarkMode)

  useEffect(() => {
    isDarkModeRef.current = isDarkMode
  }, [isDarkMode])

  const sectionRef = useRef<HTMLElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const nodesRef = useRef<(HTMLDivElement | null)[]>([])
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const [branches, setBranches] = useState<DBBranch[]>(staticFallbackBranches)
  const [selectedBranch, setSelectedBranch] = useState<DBBranch | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [closestBranch, setClosestBranch] = useState<DBBranch | null>(null)
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const mapRef = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  const routeLayerRef = useRef<any>(null)
  const branchMarkerRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)

  // 1. Fetch Branches from Supabase & Initialize Geolocation check
  useEffect(() => {
    const supabase = createClient()
    
    async function fetchBranches() {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('step_order', { ascending: true })

      if (!error && data && data.length > 0) {
        setBranches(data)
      }
    }
    
    fetchBranches()
  }, [])

  // Helper to calculate nearest branch
  const calculateNearest = (latitude: number, longitude: number) => {
    let minDistance = Infinity
    let nearest: DBBranch | null = null

    branches.forEach((branch) => {
      if (branch.status === 'LOCKED') return
      
      const R = 6371 // Earth radius in km
      const dLat = ((branch.latitude - latitude) * Math.PI) / 180
      const dLon = ((branch.longitude - longitude) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((branch.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      if (distance < minDistance) {
        minDistance = distance
        nearest = branch
      }
    })

    if (nearest) {
      setClosestBranch(nearest)
      setSelectedBranch(nearest)
    }
  }

  // Tiered fallback helper: Try free IP Geolocation API, with flagship coordinates as final safety net
  const fallbackToIPGeolocation = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/')
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          const { latitude, longitude } = data
          setUserLocation({ latitude, longitude })
          setLocationStatus('granted')
          calculateNearest(latitude, longitude)
          return
        }
      }
      throw new Error('IP Geolocation response invalid or empty')
    } catch (ipErr) {
      console.error('IP Geolocation fallback failed, using default flagship coordinates:', ipErr)
      
      // Ultimate Safe Fallback: Wolfsburger flagship restaurant (São José dos Pinhais)
      const flagshipLat = -25.5349
      const flagshipLon = -49.2008
      setUserLocation({ latitude: flagshipLat, longitude: flagshipLon })
      setLocationStatus('granted')
      calculateNearest(flagshipLat, flagshipLon)
    }
  }

  // 2. Geolocation & Haversine Formula calculation
  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      fallbackToIPGeolocation()
      return
    }

    const options = {
      enableHighAccuracy: false, // Prevent triangulation timeouts on desktop
      timeout: 6000,             // 6 seconds timeout limit
      maximumAge: 600000,        // 10 minutes cache
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })
        setLocationStatus('granted')
        calculateNearest(latitude, longitude)
      },
      (error) => {
        console.error('Error requesting location, initiating IP geolocation fallback:', error.message || error)
        fallbackToIPGeolocation()
      },
      options
    )
  }

  // 3. Dynamic Leaflet script and stylesheet injection to guarantee zero-build conflict and correct layout rendering
  useEffect(() => {
    if (typeof window === 'undefined') return

    const cssId = 'leaflet-css'
    const scriptId = 'leaflet-js'
    
    let cssLoaded = false
    let jsLoaded = false

    const checkReady = () => {
      if (cssLoaded && jsLoaded) {
        setLeafletLoaded(true)
      }
    }

    // Check if stylesheet is already in document
    let link = document.getElementById(cssId) as HTMLLinkElement | null
    if (link) {
      cssLoaded = true
    } else {
      link = document.createElement('link')
      link.id = cssId
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = 'anonymous'
      link.onload = () => {
        cssLoaded = true
        checkReady()
      }
      document.head.appendChild(link)
    }

    // Check if JS is already in window
    if ((window as any).L) {
      jsLoaded = true
    } else {
      let script = document.getElementById(scriptId) as HTMLScriptElement | null
      if (script) {
        script.addEventListener('load', () => {
          jsLoaded = true
          checkReady()
        })
      } else {
        script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
        script.crossOrigin = 'anonymous'
        script.onload = () => {
          jsLoaded = true
          checkReady()
        }
        document.head.appendChild(script)
      }
    }

    if (cssLoaded && jsLoaded) {
      setLeafletLoaded(true)
    }
  }, [])

  // 4. Draw Map with Route when leaflet loads or chosen branch/userLocation changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!leafletLoaded || !selectedBranch) return

    const L = (window as any).L
    if (!L) return

    // Clean up if container is missing or changed
    if (!mapContainerRef.current) {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      tileLayerRef.current = null
      routeLayerRef.current = null
      branchMarkerRef.current = null
      userMarkerRef.current = null
      return
    }

    let map = mapRef.current
    if (map) {
      const container = map.getContainer()
      if (container !== mapContainerRef.current) {
        map.remove()
        map = null
        mapRef.current = null
        tileLayerRef.current = null
        routeLayerRef.current = null
        branchMarkerRef.current = null
        userMarkerRef.current = null
      }
    }

    const branchCoords: [number, number] = [selectedBranch.latitude, selectedBranch.longitude]

    if (!map) {
      // Initialize Map Instance
      map = L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
      })

      const tileUrl = isDarkModeRef.current
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

      // Initialize tile layer with dynamic url and track via tileLayerRef
      tileLayerRef.current = L.tileLayer(tileUrl, {
        attribution: '&copy; CartoDB',
        maxZoom: 20
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)
      mapRef.current = map

      // Force size recalculation to prevent visual collapse in hidden layouts
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize()
        }
      }, 100)

      // GSAP Reveal animation for the Map Panel
      gsap.fromTo(mapContainerRef.current, 
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
    }

    // Update branch marker
    if (branchMarkerRef.current) {
      map.removeLayer(branchMarkerRef.current)
    }

    const branchIcon = L.divIcon({
      className: 'custom-map-icon-branch',
      html: `<div class="w-8 h-8 rounded-full bg-amber-500 border-4 border-neutral-900 dark:border-neutral-950 flex items-center justify-center font-bold text-black shadow-lg animate-pulse">W</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })

    branchMarkerRef.current = L.marker(branchCoords, { icon: branchIcon }).addTo(map)
      .bindPopup(`<strong class="text-neutral-900">${selectedBranch.name}</strong><br/><span class="text-neutral-600">${selectedBranch.address}</span>`)
      .openPopup()

    // Update user marker
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current)
      userMarkerRef.current = null
    }

    // Layer Cleanup Execution: check if routeLayerRef.current exists and remove it
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current)
      routeLayerRef.current = null
    }

    if (userLocation) {
      const userCoords: [number, number] = [userLocation.latitude, userLocation.longitude]
      const userIcon = L.divIcon({
        className: 'custom-map-icon-user',
        html: `<div class="w-6 h-6 rounded-full bg-red-500 border-3 border-white shadow-md flex items-center justify-center font-bold text-white text-[10px]">YOU</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      userMarkerRef.current = L.marker(userCoords, { icon: userIcon }).addTo(map)
        .bindPopup(`<span class="text-neutral-900">Your Location</span>`)

      // Drawing a premium routing polyline with contrast tuning
      routeLayerRef.current = L.polyline([userCoords, branchCoords], {
        color: isDarkModeRef.current ? '#f59e0b' : '#1e3a8a',
        weight: 4,
        dashArray: '8, 8', // dashed design for transit theme
        opacity: 0.8
      }).addTo(map)

      // Fit map bounds to encompass both markers comfortably
      map.fitBounds(L.latLngBounds([userCoords, branchCoords]), {
        padding: [50, 50],
        animate: true,
        duration: 1.0
      })
    } else {
      // Just fly to/center on branch coords if user location is not yet available
      map.setView(branchCoords, 14, {
        animate: true,
        duration: 1.0
      })
    }

    // Force GSAP ScrollTrigger to recalculate alignment coordinates after layout changes
    ScrollTrigger.refresh()
    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 200)
    return () => clearTimeout(timer)
  }, [leafletLoaded, selectedBranch, userLocation])

  // Theme Toggle Effect - swap tile layer URL and polyline style smoothly
  useEffect(() => {
    const tileUrl = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(tileUrl)
    }

    if (routeLayerRef.current) {
      routeLayerRef.current.setStyle({
        color: isDarkMode ? '#f59e0b' : '#1e3a8a'
      })
    }

    // Recalculate GSAP ScrollTrigger timeline track line dimensions
    ScrollTrigger.refresh()
    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 200)
    return () => clearTimeout(timer)
  }, [isDarkMode])

  // Cleanup map when component unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      tileLayerRef.current = null
      routeLayerRef.current = null
      branchMarkerRef.current = null
      userMarkerRef.current = null
    }
  }, [])

  // 5. GSAP Entrance ScrollTrigger Animations (Preserves original aesthetics flawlessly)
  useEffect(() => {
    const isMobile = window.innerWidth < 768

    const ctx = gsap.context(() => {
      // SVG path drawing animation
      if (pathRef.current && !isMobile) {
        const pathLength = pathRef.current.getTotalLength()
        
        gsap.set(pathRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        })

        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            end: 'bottom 40%',
            scrub: 1,
          },
        })
      }

      // Node activation animations
      nodesRef.current.forEach((node, index) => {
        if (!node) return

        const isLocked = branches[index]?.status === 'LOCKED'

        gsap.set(node, { scale: 0, opacity: 0 })

        gsap.to(node, {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: node,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
          onComplete: () => {
            if (!isLocked && !isMobile) {
              gsap.to(node.querySelector('.node-ring'), {
                scale: 1.5,
                opacity: 0,
                duration: 1.5,
                repeat: -1,
                ease: 'power2.out',
              })
            }
          },
        })
      })

      // Card reveal animations
      cardsRef.current.forEach((card, index) => {
        if (!card) return

        gsap.set(card, { 
          opacity: 0, 
          x: isMobile ? 0 : (index % 2 === 0 ? -30 : 30),
          y: 20,
        })

        gsap.to(card, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [branches])

  return (
    <section
      ref={sectionRef}
      id="branches"
      className={`relative py-20 md:py-32 px-4 md:px-12 overflow-hidden transition-colors duration-500 ${
        isDarkMode ? 'dark bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-900'
      }`}
    >
      {/* Section Header */}
      <div className="max-w-screen-xl mx-auto mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-amber-500 text-xs md:text-sm font-medium tracking-widest uppercase mb-2 md:mb-4">
            Find Us
          </p>
          <h2 className="font-display text-4xl md:text-fluid-section text-neutral-900 dark:text-white uppercase leading-none">
            Our <span className="text-amber-500">Locations</span>
          </h2>
        </div>

        {/* Location Permission Activator & Theme Toggle */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Local Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold transition-all duration-300 text-sm tracking-wide shadow-md group hover:scale-[1.03] active:scale-[0.98]"
            title="Toggle Section Map Theme"
          >
            {isDarkMode ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-500 animate-[spin_10s_linear_infinite]">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
                <span>Light Theme</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-indigo-500">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
                <span>Dark Theme</span>
              </>
            )}
          </button>

          {/* Location Permission Activator */}
          <button
            onClick={requestLocation}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-all duration-300 text-sm tracking-wide shadow-lg group hover:scale-[1.03] active:scale-[0.98]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="group-hover:rotate-12 transition-transform duration-300"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            {locationStatus === 'granted' ? 'Location Shared' : 'Find Nearest Branch'}
          </button>
        </div>
      </div>

      {/* Geolocation feedback alert */}
      {closestBranch && (
        <div className="max-w-screen-md mx-auto mb-10 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span className="text-sm text-neutral-700 dark:text-neutral-200">
              Closest active branch found: <strong className="text-amber-500">{closestBranch.name}</strong>
            </span>
          </div>
          <button
            onClick={() => setSelectedBranch(closestBranch)}
            className="text-xs text-amber-500 hover:text-amber-400 font-bold underline"
          >
            View Route
          </button>
        </div>
      )}

      {/* Interactive Map Dashboard */}
      {selectedBranch && (
        <div className="max-w-screen-lg mx-auto mb-16">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden p-6 shadow-2xl relative transition-colors duration-300">
            <h3 className="font-display text-xl md:text-2xl uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-2">
              Route to {selectedBranch.name}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">{selectedBranch.address} | Hours: {selectedBranch.hours}</p>

            <div 
              ref={mapContainerRef} 
              id="wolf-map-container"
              className="w-full h-[300px] md:h-[450px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 relative overflow-hidden" 
              style={{ zIndex: 1 }}
            />
          </div>
        </div>
      )}

      {/* Roadmap Container */}
      <div className="relative max-w-screen-lg mx-auto">
        {/* SVG Transit Path line - Hidden on Mobile */}
        <svg
          className="absolute left-1/2 -translate-x-1/2 top-0 w-12 md:w-24 pointer-events-none hidden md:block"
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
          style={{ height: `${branches.length * 240}px` }}
        >
          <path
            d="M50 0 L50 1000"
            className="stroke-neutral-200 dark:stroke-neutral-800/40"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            ref={pathRef}
            d="M50 0 L50 1000"
            stroke="#f59e0b"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
          />
        </svg>

        {/* Branch Nodes Timeline List */}
        <div className="relative">
          {branches.map((branch, index) => (
            <div
              key={branch.id}
              className={`relative flex items-center gap-4 md:gap-8 py-8 md:py-16 ${
                index % 2 === 0 ? 'md:flex-row flex-col' : 'md:flex-row-reverse flex-col'
              }`}
            >
              {/* Timeline Node Orb */}
              <div
                ref={(el) => { nodesRef.current[index] = el }}
                className={`w-12 h-12 md:w-16 md:h-16 flex-shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2 md:z-10 flex items-center justify-center rounded-full border-3 md:border-4 cursor-pointer transition-transform duration-300 hover:scale-110 ${
                  branch.status === 'LOCKED'
                    ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600'
                    : selectedBranch?.id === branch.id
                      ? 'bg-amber-500 border-white shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                      : 'bg-white dark:bg-neutral-950 border-amber-500'
                }`}
                onClick={() => branch.status !== 'LOCKED' && setSelectedBranch(branch)}
              >
                {!branch.status && (
                  <div className="node-ring absolute inset-0 rounded-full border-2 border-amber-500" />
                )}
                
                {branch.status === 'LOCKED' ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-neutral-500 md:w-6 md:h-6"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ) : (
                  <span className={`font-bold text-lg md:text-xl ${selectedBranch?.id === branch.id ? 'text-black' : 'text-amber-500'}`}>
                    {branch.step_order}
                  </span>
                )}
              </div>

              {/* timeline Card */}
              <div
                ref={(el) => { cardsRef.current[index] = el }}
                className={`w-full md:w-[calc(50%-4rem)] ${
                  index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                }`}
              >
                <div
                  onClick={() => branch.status !== 'LOCKED' && setSelectedBranch(branch)}
                  className={`p-4 md:p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    branch.status === 'LOCKED'
                      ? 'bg-neutral-100/40 dark:bg-neutral-900/40 border-neutral-200/40 dark:border-neutral-800/40 opacity-70'
                      : selectedBranch?.id === branch.id
                        ? 'bg-white dark:bg-neutral-900 border-amber-500 dark:border-amber-500 shadow-[0_10px_30px_rgba(245,158,11,0.15)] scale-[1.01]'
                        : 'bg-white/60 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-amber-500/40 hover:bg-white dark:hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
                    <h3
                      className={`font-display text-lg md:text-2xl uppercase leading-tight ${
                        branch.status === 'LOCKED' ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-white'
                      }`}
                    >
                      {branch.name}
                    </h3>
                    {branch.status === 'LOCKED' && (
                      <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded uppercase tracking-wider whitespace-nowrap">
                        Soon
                      </span>
                    )}
                  </div>
                  
                  <p
                    className={`text-xs md:text-sm mb-1 ${
                      branch.status === 'LOCKED' ? 'text-neutral-450 dark:text-neutral-600' : 'text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {branch.address}
                  </p>
                  <p
                    className={`text-xs md:text-sm mb-3 md:mb-4 ${
                      branch.status === 'LOCKED' ? 'text-neutral-450 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    {branch.hours}
                  </p>

                  {branch.status !== 'LOCKED' && (
                    <button
                      className="inline-flex items-center gap-2 text-amber-500 text-xs md:text-sm font-semibold hover:text-amber-400 transition-colors duration-200 group"
                    >
                      <span>{selectedBranch?.id === branch.id ? 'Route Selected' : 'Show Route'}</span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-amber-500/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}
