import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Expense } from '@/types/expense'

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })

    if (!error && data) setExpenses(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return { expenses, loading, refetch: fetchExpenses }
}