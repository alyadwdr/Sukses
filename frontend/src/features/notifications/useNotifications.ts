import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface StockNotification {
  id: string
  name: string
  stock: number
  unit: string
  min_stock: number
  level: 'low' | 'critical'
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<StockNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, stock, unit, min_stock')
      .then(({ data }) => {
        const filtered = (data ?? [])
          .filter((p) => p.stock <= p.min_stock)
          .map((p) => ({
            ...p,
            level: (p.stock <= p.min_stock / 2 ? 'critical' : 'low') as 'low' | 'critical',
          }))
        setNotifications(filtered)
        setLoading(false)
      })
  }, [])

  return { notifications, loading }
}