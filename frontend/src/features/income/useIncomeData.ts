import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusinessFilter } from '@/context/BusinessFilterContext'

export function useIncomeData() {
  const [totalIncome, setTotalIncome] = useState(0)
  const [loading, setLoading] = useState(true)
  const { filter } = useBusinessFilter()

  const fetchData = useCallback(async () => {
    setLoading(true)

    const { data: transactions } = await supabase
      .from('transactions')
      .select(`
        total,
        transaction_items ( products ( category ) )
      `)

    const relevant = (transactions ?? []).filter((trx) => {
      if (filter === 'all') return true
      return trx.transaction_items.some((item: any) => item.products?.category === filter)
    })

    const total = relevant.reduce((sum, trx) => sum + trx.total, 0)
    setTotalIncome(total)
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { totalIncome, loading }
}