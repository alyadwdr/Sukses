import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusinessFilter } from '@/context/BusinessFilterContext'

interface DashboardData {
  todaySales: number
  todayExpenses: number
  todayTransactionCount: number
  chartData: { date: string; sales: number }[]
  recentTransactions: { id: string; trx_number: string; created_at: string; total: number; itemCount: number }[]
  lowStockProducts: { id: string; name: string; stock: number; unit: string }[]
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { filter } = useBusinessFilter()

  const fetchData = useCallback(async () => {
    setLoading(true)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 6)
    weekAgo.setHours(0, 0, 0, 0)

    // Transactions for today + last 7 days, with items so we can filter by category
    const { data: transactions } = await supabase
      .from('transactions')
      .select(`
        id, trx_number, total, created_at,
        transaction_items ( quantity, subtotal, products ( category ) )
      `)
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false })

    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, expense_date')
      .gte('expense_date', todayStart.toISOString().split('T')[0])

    const { data: lowStock } = await supabase
      .from('products')
      .select('id, name, stock, unit, min_stock')
      .order('stock', { ascending: true })

    // Filter transactions by category if a filter is active
    const relevantTrx = (transactions ?? []).filter((trx) => {
      if (filter === 'all') return true
      return trx.transaction_items.some((item: any) => item.products?.category === filter)
    })

    const todayTrx = relevantTrx.filter((trx) => new Date(trx.created_at) >= todayStart)
    const todaySales = todayTrx.reduce((sum, trx) => sum + trx.total, 0)
    const todayExpenses = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0)

    // Build a 7-day chart
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(weekAgo)
      day.setDate(day.getDate() + i)
      const dayStr = day.toISOString().split('T')[0]
      const daySales = relevantTrx
        .filter((trx) => trx.created_at.startsWith(dayStr))
        .reduce((sum, trx) => sum + trx.total, 0)
      return { date: day.toLocaleDateString('id-ID', { weekday: 'short' }), sales: daySales }
    })

    const recentTransactions = relevantTrx.slice(0, 5).map((trx) => ({
      id: trx.id,
      trx_number: trx.trx_number,
      created_at: trx.created_at,
      total: trx.total,
      itemCount: trx.transaction_items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    }))

    const lowStockProducts = (lowStock ?? []).filter((p) => p.stock <= p.min_stock).slice(0, 5)

    setData({
      todaySales,
      todayExpenses,
      todayTransactionCount: todayTrx.length,
      chartData,
      recentTransactions,
      lowStockProducts,
    })
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, refetch: fetchData }
}