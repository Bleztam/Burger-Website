'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from 'ai/react'
import { useCart } from '@/components/cart-provider'
import gsap from 'gsap'
import { MessageSquare, X, Send, Bot, ShoppingCart } from 'lucide-react'

export function AiConciergeChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const { addToCart } = useCart()
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const toggleBtnRef = useRef<HTMLButtonElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Track already processed cart tool calls to avoid duplicate cart additions
  const [processedToolCalls, setProcessedToolCalls] = useState<Set<string>>(new Set())

  // Initialize Vercel AI SDK Client hook
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    maxSteps: 5, // allows tool-calls to execute and loop
  })

  // Scroll to bottom of chat automatically when messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Watch messages for completed 'add_to_cart' tool calls
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.toolInvocations) {
        msg.toolInvocations.forEach((invocation) => {
          const { toolName, toolCallId, state } = invocation
          if (toolName === 'add_to_cart' && state === 'result') {
            if (!processedToolCalls.has(toolCallId)) {
              const result = (invocation as any).result
              if (result && result.success) {
                // Call global Cart Context addToCart method
                addToCart(result.id, result.name, result.price, result.quantity)
                
                // Add to processed set
                setProcessedToolCalls((prev) => {
                  const updated = new Set(prev)
                  updated.add(toolCallId)
                  return updated
                })
              }
            }
          }
        })
      }
    })
  }, [messages, processedToolCalls, addToCart])

  // Handle open/close GSAP animations
  useEffect(() => {
    if (!chatWindowRef.current) return

    if (isOpen) {
      // Slide and fade in chat window
      gsap.fromTo(chatWindowRef.current,
        { opacity: 0, scale: 0.9, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)', pointerEvents: 'auto' }
      )
      // Pulse animation on toggle button
      if (toggleBtnRef.current) {
        gsap.to(toggleBtnRef.current, { scale: 0.9, rotate: 90, duration: 0.2 })
      }
    } else {
      // Slide and fade out
      gsap.to(chatWindowRef.current,
        { opacity: 0, scale: 0.95, y: 30, duration: 0.3, ease: 'power2.in', pointerEvents: 'none' }
      )
      if (toggleBtnRef.current) {
        gsap.to(toggleBtnRef.current, { scale: 1, rotate: 0, duration: 0.2 })
      }
    }
  }, [isOpen])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* 1. Glassmorphic Chat Window */}
      <div
        ref={chatWindowRef}
        className="w-[90vw] sm:w-[380px] h-[500px] bg-neutral-900/90 backdrop-blur-xl border border-neutral-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col mb-4 pointer-events-none opacity-0"
        style={{ transformOrigin: 'bottom right' }}
      >
        {/* Chat Window Header */}
        <div className="bg-amber-500 p-4 flex items-center justify-between text-black">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
              <Bot size={18} className="text-amber-500" />
            </div>
            <div>
              <h4 className="font-display font-bold tracking-wide uppercase text-sm">WOLF CONCIERGE</h4>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-900 animate-ping" />
                <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider">AI Assistant Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message Container Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Welcome Message */}
          <div className="flex gap-2 items-start max-w-[85%]">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot size={12} className="text-amber-500" />
            </div>
            <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-800 text-neutral-200 text-xs leading-relaxed">
              Yo! I am your **Wolfsburger Concierge**. Ask me for menu suggestions, current pricing, nearest branch route, or let me add items directly to your cart for checkout! 🍔🔥
            </div>
          </div>

          {/* Render Messages */}
          {messages.map((message) => {
            const isUser = message.role === 'user'
            return (
              <div
                key={message.id}
                className={`flex gap-2 items-start max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={12} className="text-amber-500" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'bg-neutral-850 border border-neutral-800 text-neutral-250'
                  }`}
                >
                  {/* Clean Text display with basic markdown fallback */}
                  {message.content.split('\n').map((line, idx) => (
                    <p key={idx} className={idx > 0 ? 'mt-1' : ''}>
                      {line.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                    </p>
                  ))}

                  {/* Render Tool Invocations inside chat */}
                  {message.toolInvocations?.map((toolInvocation) => {
                    const { toolName, toolCallId, state } = toolInvocation
                    
                    if (toolName === 'add_to_cart') {
                      return (
                        <div key={toolCallId} className="mt-2 p-2 bg-neutral-900/60 border border-amber-500/30 rounded-lg flex items-center gap-2 text-[10px] text-amber-400">
                          <ShoppingCart size={12} />
                          <span>
                            {state === 'result'
                              ? `Added recommended item to cart!`
                              : `Adding to cart...`}
                          </span>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            )
          })}

          {/* Loader */}
          {isLoading && (
            <div className="flex gap-2 items-start max-w-[80%]">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={12} className="text-amber-500 animate-pulse" />
              </div>
              <div className="p-3 rounded-2xl bg-neutral-800/40 border border-neutral-800/40 text-neutral-400 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-800/80 bg-neutral-950 flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="I have R$ 40 and love spicy food..."
            className="flex-1 bg-neutral-900 border border-neutral-850 rounded-xl px-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer"
          >
            <Send size={14} />
          </button>
        </form>
      </div>

      {/* 2. Floating Toggle Button */}
      <button
        ref={toggleBtnRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-amber-500 text-black hover:bg-amber-400 flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 hover:scale-105 cursor-pointer border-3 border-black group"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} className="group-hover:rotate-6 transition-transform" />}
      </button>
    </div>
  )
}
