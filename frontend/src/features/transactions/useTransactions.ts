import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface TransactionRow {
  id: string
  trx_number: string
  payment_method: string
  total: number
  created_at: string
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
        transaction_items (
          id,
          quantity,
          price_at_sale,
          subtotal,
          products ( name, category )
        )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) setTransactions(data as unknown as TransactionRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, loading, refetch: fetchTransactions }
}