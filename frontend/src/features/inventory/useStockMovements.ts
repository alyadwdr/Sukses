import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface StockMovementRow {
  id: string
  change: number
  reason: string
  created_at: string
  products: {
    name: string
    unit: string
    category: string
  }
}

export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovementRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMovements = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('stock_movements')
      .select(`
        id,
        change,
        reason,
        created_at,
        products ( name, unit, category )
      `)
      .order('created_at', { ascending: false })
      .limit(300)

    if (!error && data) setMovements(data as unknown as StockMovementRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMovements()
  }, [fetchMovements])

  return { movements, loading, refetch: fetchMovements }
}