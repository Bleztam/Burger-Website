'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (id: string, name: string, price: number, quantity?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const storedCart = localStorage.getItem('wolfsburger_cart')
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart))
      } catch (e) {
        console.error('Error hydrating cart:', e)
      }
    }
  }, [])

  // Persist cart changes to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('wolfsburger_cart', JSON.stringify(cart))
    }
  }, [cart, mounted])

  const addToCart = (id: string, name: string, price: number, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === id)
      if (existing) {
        return prevCart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [...prevCart, { id, name, price, quantity }]
    })
    setIsCartOpen(true) // slide open the cart overlay to WOW the user
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
