import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface StockMovementRow {
  id: string
  change: number
  reason: string
  created_at: string
  product_id: string
  products: {
    name: string
    unit: string
    category: string
    variant: string | null
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
        product_id,
        products ( name, unit, category, variant )
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