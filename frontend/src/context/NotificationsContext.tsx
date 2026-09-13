import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

export interface StockNotification {
  id: string
  name: string
  stock: number
  unit: string
  min_stock: number
  level: 'low' | 'critical'
}

interface NotificationsContextType {
  notifications: StockNotification[]
  loading: boolean
  refetch: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<StockNotification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('id, name, stock, unit, min_stock')
    const filtered = (data ?? [])
      .filter((p) => p.stock <= p.min_stock)
      .map((p) => ({
        ...p,
        level: (p.stock <= p.min_stock / 2 ? 'critical' : 'low') as 'low' | 'critical',
      }))
    setNotifications(filtered)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <NotificationsContext.Provider value={{ notifications, loading, refetch: fetchNotifications }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider')
  return context
}