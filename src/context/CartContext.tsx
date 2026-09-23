import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export interface CartItem {
  id: number
  name: string
  slug: string
  category_slug: string
  price: number
  description: string
  image_url: string
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  total: number
  addToCart: (item: CartItem) => void
  removeFromCart: (id: number) => void
  clearCart: () => void
}

const CART_KEY = 'la_orden_cart'

const normalizeCart = (value: unknown): CartItem[] => {
  if (!Array.isArray(value)) {
    return []
  }

  const safeItems = value.filter((item): item is CartItem => {
    if (!item || typeof item !== 'object') return false
    const candidate = item as Partial<CartItem>
    return typeof candidate.id === 'number' && typeof candidate.name === 'string' && typeof candidate.price === 'number'
  })

  return safeItems.slice(0, 1)
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const getInitialCart = (): CartItem[] => {
  try {
    const storedCart = localStorage.getItem(CART_KEY)
    if (!storedCart) return []

    return normalizeCart(JSON.parse(storedCart))
  } catch {
    localStorage.removeItem(CART_KEY)
    return []
  }
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(getInitialCart)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items, isHydrated])

  const addToCart = (item: CartItem) => {
    setItems((current) => {
      if (current.some((currentItem) => currentItem.id === item.id)) {
        return current
      }

      return [item]
    })
  }

  const removeFromCart = (id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setItems([])
  }

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.length,
    total: items[0]?.price ?? 0,
    addToCart,
    removeFromCart,
    clearCart,
  }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }

  return context
}
