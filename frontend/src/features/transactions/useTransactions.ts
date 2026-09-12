import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusinessFilter } from '@/context/BusinessFilterContext'
import { filterItemsByCategory } from '@/lib/categoryFilter'

export interface TransactionRow {
  id: string
  trx_number: string
  payment_method: string
  total: number
  created_at: string
  notes?: string | null
  cash_received?: number | null
  transaction_items: {
    id: string
    quantity: number
    price_at_sale: number
    subtotal: number
    products: {
      name: string
      category: string
    }
  }[]
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [loading, setLoading] = useState(true)
  const { filter } = useBusinessFilter()

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        trx_number,
        payment_method,
        total,
        created_at,
        notes,
        cash_received,
        transaction_items (
          id,
          quantity,
          price_at_sale,
          subtotal,
          products ( name, category )
        )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const rows = data as unknown as TransactionRow[]
      const filtered = rows
        .map((trx) => ({
          ...trx,
          transaction_items: filterItemsByCategory(trx.transaction_items, filter),
        }))
        .filter((trx) => trx.transaction_items.length > 0)
      setTransactions(filtered)
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, loading, refetch: fetchTransactions }
}