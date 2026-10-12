import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ProductUnit } from '@/types/productUnit'

export function useProductUnits() {
  const [units, setUnits] = useState<ProductUnit[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUnits = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('product_units').select('*').order('sort_order', { ascending: true })
    if (!error && data) setUnits(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUnits()
  }, [fetchUnits])

  const unitsByProduct = useCallback(
    (productId: string) => units.filter((u) => u.product_id === productId),
    [units]
  )

  return { units, unitsByProduct, loading, refetch: fetchUnits }
}