import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusinessFilter } from '@/context/BusinessFilterContext'

export type ChartPeriod = '7d' | '1m' | '1y'

interface DashboardData {
  todaySales: number
  todayExpenses: number
  todayTransactionCount: number
  chartData: { label: string; sales: number }[]
  recentTransactions: { id: string; trx_number: string; created_at: string; total: number; itemCount: number }[]
  lowStockProducts: { id: string; name: string; stock: number; unit: string }[]
}

const TRX_SELECT = `
  id, trx_number, total, created_at,
  transaction_items ( quantity, subtotal, products ( category ) )
`

function matchesFilter(trx: any, filter: string) {
  if (filter === 'all') return true
  return trx.transaction_items.some((item: any) => item.products?.category === filter)
}

export function useDashboardData(period: ChartPeriod) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { filter } = useBusinessFilter()

  const fetchData = useCallback(async () => {
    setLoading(true)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const rangeStart = new Date()
    if (period === '7d') rangeStart.setDate(rangeStart.getDate() - 6)
    else if (period === '1m') rangeStart.setDate(rangeStart.getDate() - 29)
    else rangeStart.setMonth(rangeStart.getMonth() - 11)
    rangeStart.setHours(0, 0, 0, 0)

    const [{ data: periodTrx }, { data: latestTrx }, { data: expenses }, { data: lowStock }] = await Promise.all([
      supabase.from('transactions').select(TRX_SELECT).gte('created_at', rangeStart.toISOString()),
      supabase.from('transactions').select(TRX_SELECT).order('created_at', { ascending: false }).limit(30),
      supabase
        .from('expenses')
        .select('amount, expense_date')
        .gte('expense_date', todayStart.toISOString().split('T')[0]),
      supabase.from('products').select('id, name, stock, unit, min_stock').order('stock', { ascending: true }),
    ])

    const relevantPeriodTrx = (periodTrx ?? []).filter((trx) => matchesFilter(trx, filter))
    const relevantLatestTrx = (latestTrx ?? []).filter((trx) => matchesFilter(trx, filter))

    const todayTrx = relevantPeriodTrx.filter((trx) => new Date(trx.created_at) >= todayStart)
    const todaySales = todayTrx.reduce((sum, trx) => sum + trx.total, 0)
    const todayExpenses = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0)

    let chartData: { label: string; sales: number }[] = []

    if (period === '7d' || period === '1m') {
      const days = period === '7d' ? 7 : 30
      chartData = Array.from({ length: days }).map((_, i) => {
        const day = new Date(rangeStart)
        day.setDate(day.getDate() + i)
        const dayStr = day.toISOString().split('T')[0]
        const daySales = relevantPeriodTrx
          .filter((trx) => trx.created_at.startsWith(dayStr))
          .reduce((sum, trx) => sum + trx.total, 0)
        const label =
          period === '7d'
            ? day.toLocaleDateString('id-ID', { weekday: 'short' })
            : day.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })
        return { label, sales: daySales }
      })
    } else {
      chartData = Array.from({ length: 12 }).map((_, i) => {
        const month = new Date(rangeStart)
        month.setMonth(month.getMonth() + i)
        const monthSales = relevantPeriodTrx
          .filter((trx) => {
            const d = new Date(trx.created_at)
            return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()
          })
          .reduce((sum, trx) => sum + trx.total, 0)
        return { label: month.toLocaleDateString('id-ID', { month: 'short' }), sales: monthSales }
      })
    }

    const recentTransactions = relevantLatestTrx.slice(0, 10).map((trx) => ({
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
  }, [filter, period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, refetch: fetchData }
}