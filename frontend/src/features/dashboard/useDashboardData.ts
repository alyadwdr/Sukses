import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusinessFilter } from '@/context/BusinessFilterContext'
import { filterItemsByCategory } from '@/lib/categoryFilter'

export type ChartPeriod = '7d' | '1m' | '1y'

interface DashboardData {
  todaySales: number
  todayExpenses: number
  todayTransactionCount: number
  todayNetProfit: number
  chartData: { label: string; sales: number; expenses: number }[]
  recentTransactions: { id: string; trx_number: string; created_at: string; total: number; itemCount: number }[]
  lowStockProducts: { id: string; name: string; stock: number; unit: string }[]
  bestSellers: { name: string; qty: number }[]
}

const TRX_SELECT = `
  id, trx_number, total, created_at,
  transaction_items ( quantity, subtotal, products ( name, category, purchase_price ) )
`

function relevantItems(trx: any, filter: string) {
  return filterItemsByCategory(trx.transaction_items, filter as any)
}

function trxSalesFor(trx: any, filter: string) {
  return relevantItems(trx, filter).reduce((s: number, i: any) => s + i.subtotal, 0)
}

export function useDashboardData(period: ChartPeriod) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { filter } = useBusinessFilter()

  const fetchData = useCallback(async () => {
    setLoading(true)

    const now = new Date()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    let rangeStart: Date
    let rangeEnd: Date

    if (period === '7d') {
      rangeStart = new Date()
      rangeStart.setDate(rangeStart.getDate() - 6)
      rangeStart.setHours(0, 0, 0, 0)
      rangeEnd = new Date()
      rangeEnd.setHours(23, 59, 59, 999)
    } else if (period === '1m') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    } else {
      rangeStart = new Date(now.getFullYear(), 0, 1)
      rangeEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
    }

    const [{ data: periodTrx }, { data: latestTrx }, { data: periodExpenses }, { data: todayExpensesData }, { data: lowStock }] =
      await Promise.all([
        supabase.from('transactions').select(TRX_SELECT).gte('created_at', rangeStart.toISOString()).lte('created_at', rangeEnd.toISOString()),
        supabase.from('transactions').select(TRX_SELECT).order('created_at', { ascending: false }).limit(30),
        supabase
          .from('expenses')
          .select('amount, expense_date')
          .gte('expense_date', rangeStart.toISOString().split('T')[0])
          .lte('expense_date', rangeEnd.toISOString().split('T')[0]),
        supabase.from('expenses').select('amount, expense_date').gte('expense_date', todayStart.toISOString().split('T')[0]),
        supabase.from('products').select('id, name, stock, unit, min_stock').order('stock', { ascending: true }),
      ])

    // Hanya simpan transaksi yang punya minimal 1 item sesuai kategori filter
    const relevantPeriodTrx = (periodTrx ?? []).filter((trx) => relevantItems(trx, filter).length > 0)
    const relevantLatestTrx = (latestTrx ?? []).filter((trx) => relevantItems(trx, filter).length > 0)

    const todayTrx = relevantPeriodTrx.filter((trx) => new Date(trx.created_at) >= todayStart)
    const todaySales = todayTrx.reduce((sum, trx) => sum + trxSalesFor(trx, filter), 0)
    const todayCostOfGoods = todayTrx.reduce(
      (sum, trx) =>
        sum + relevantItems(trx, filter).reduce((s: number, i: any) => s + i.products.purchase_price * i.quantity, 0),
      0
    )
    const todayExpenses = (todayExpensesData ?? []).reduce((sum, e) => sum + e.amount, 0)
    const todayNetProfit = todaySales - todayCostOfGoods - todayExpenses

    let chartData: { label: string; sales: number; expenses: number }[] = []

    if (period === '7d') {
      chartData = Array.from({ length: 7 }).map((_, i) => {
        const day = new Date(rangeStart)
        day.setDate(day.getDate() + i)
        const dayStr = day.toISOString().split('T')[0]
        const daySales = relevantPeriodTrx
          .filter((trx) => trx.created_at.startsWith(dayStr))
          .reduce((sum, trx) => sum + trxSalesFor(trx, filter), 0)
        const dayExpenses = (periodExpenses ?? [])
          .filter((e) => e.expense_date === dayStr)
          .reduce((sum, e) => sum + e.amount, 0)
        return { label: day.toLocaleDateString('id-ID', { weekday: 'short' }), sales: daySales, expenses: dayExpenses }
      })
    } else if (period === '1m') {
      const daysInMonth = rangeEnd.getDate()
      chartData = Array.from({ length: daysInMonth }).map((_, i) => {
        const day = new Date(rangeStart)
        day.setDate(i + 1)
        const dayStr = day.toISOString().split('T')[0]
        const daySales = relevantPeriodTrx
          .filter((trx) => trx.created_at.startsWith(dayStr))
          .reduce((sum, trx) => sum + trxSalesFor(trx, filter), 0)
        const dayExpenses = (periodExpenses ?? [])
          .filter((e) => e.expense_date === dayStr)
          .reduce((sum, e) => sum + e.amount, 0)
        return { label: String(i + 1), sales: daySales, expenses: dayExpenses }
      })
    } else {
      chartData = Array.from({ length: 12 }).map((_, i) => {
        const monthSales = relevantPeriodTrx
          .filter((trx) => {
            const d = new Date(trx.created_at)
            return d.getMonth() === i && d.getFullYear() === rangeStart.getFullYear()
          })
          .reduce((sum, trx) => sum + trxSalesFor(trx, filter), 0)
        const monthExpenses = (periodExpenses ?? [])
          .filter((e) => {
            const d = new Date(e.expense_date)
            return d.getMonth() === i && d.getFullYear() === rangeStart.getFullYear()
          })
          .reduce((sum, e) => sum + e.amount, 0)
        const monthLabel = new Date(rangeStart.getFullYear(), i, 1).toLocaleDateString('id-ID', { month: 'short' })
        return { label: monthLabel, sales: monthSales, expenses: monthExpenses }
      })
    }

    const recentTransactions = relevantLatestTrx.slice(0, 10).map((trx) => {
      const items = relevantItems(trx, filter)
      return {
        id: trx.id,
        trx_number: trx.trx_number,
        created_at: trx.created_at,
        total: items.reduce((s: number, i: any) => s + i.subtotal, 0),
        itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      }
    })

    const lowStockProducts = (lowStock ?? []).filter((p) => p.stock <= p.min_stock).slice(0, 5)

    const productQty: Record<string, number> = {}
    relevantPeriodTrx.forEach((trx) => {
      relevantItems(trx, filter).forEach((item: any) => {
        const name = item.products?.name ?? 'Produk'
        productQty[name] = (productQty[name] ?? 0) + item.quantity
      })
    })
    const bestSellers = Object.entries(productQty)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10)

    setData({
      todaySales,
      todayExpenses,
      todayTransactionCount: todayTrx.length,
      todayNetProfit,
      chartData,
      recentTransactions,
      lowStockProducts,
      bestSellers,
    })
    setLoading(false)
  }, [filter, period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, refetch: fetchData }
}