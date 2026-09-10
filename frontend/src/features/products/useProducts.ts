import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/product'
import { useBusinessFilter } from '@/context/BusinessFilterContext'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { filter } = useBusinessFilter()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('category', filter)
    }

    const { data, error } = await query
    if (!error && data) setProducts(data)
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, refetch: fetchProducts }
}