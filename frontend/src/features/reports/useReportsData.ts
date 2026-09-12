import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusinessFilter } from '@/context/BusinessFilterContext'
import { filterItemsByCategory } from '@/lib/categoryFilter'

export type ReportTimeFilter = 'all' | 'today' | 'month' | 'year' | 'custom'

interface TransactionItemRow {
  date: string
  trx_number: string
  product: string
  category: string
  qty: number
  price: number
  subtotal: number
}

interface ExpenseRow {
  date: string
  description: string
  category: string
  amount: number
}

interface ReportsData {
  totalSales: number
  transactionCount: number
  totalItemsSold: number
  avgTransaction: number
  totalExpenses: number
  costOfGoods: number
  grossProfit: number
  chartData: { label: string; sales: number }[]
  bestSellers: { name: string; qty: number }[]
  transactionItemRows: TransactionItemRow[]
  expenseRows: ExpenseRow[]
  periodLabel: string
}

function getRange(timeFilter: ReportTimeFilter, customFrom?: string, customTo?: string) {
  const now = new Date()

  if (timeFilter === 'today') {
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const end = new Date(); end.setHours(23, 59, 59, 999)
    return { start, end, label: `Hari Ini (${start.toLocaleDateString('id-ID')})` }
  }
  if (timeFilter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    return { start, end, label: start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }
  }
  if (timeFilter === 'year') {
    const start = new Date(now.getFullYear(), 0, 1)
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
    return { start, end, label: String(now.getFullYear()) }
  }
  if (timeFilter === 'custom' && customFrom && customTo) {
    const start = new Date(customFrom); start.setHours(0, 0, 0, 0)
    const end = new Date(customTo); end.setHours(23, 59, 59, 999)
    return {
      start,
      end,
      label: `${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`,
    }
  }
  return { start: null, end: null, label: 'Semua Waktu' }
}

export function useReportsData(timeFilter: ReportTimeFilter, customFrom?: string, customTo?: string) {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { filter } = useBusinessFilter()

  const fetchData = useCallback(async () => {
    setLoading(true)

    const { start, end, label } = getRange(timeFilter, customFrom, customTo)

    let trxQuery = supabase.from('transactions').select(`
      id, trx_number, total, created_at,
      transaction_items ( quantity, subtotal, price_at_sale, products ( name, category, purchase_price ) )
    `)
    let expQuery = supabase.from('expenses').select('description, category, amount, expense_date')

    if (start && end) {
      trxQuery = trxQuery.gte('created_at', start.toISOString()).lte('created_at', end.toISOString())
      expQuery = expQuery.gte('expense_date', start.toISOString().split('T')[0]).lte('expense_date', end.toISOString().split('T')[0])
    }

    const { data: transactions } = await trxQuery
    const { data: expenses } = await expQuery

    const relevantTrx = (transactions ?? [])
      .map((trx) => ({ ...trx, transaction_items: filterItemsByCategory(trx.transaction_items as any, filter) }))
      .filter((trx) => trx.transaction_items.length > 0)

    const totalSales = relevantTrx.reduce(
      (sum, trx) => sum + trx.transaction_items.reduce((s: number, i: any) => s + i.subtotal, 0),
      0
    )
    const transactionCount = relevantTrx.length
    const totalItemsSold = relevantTrx.reduce(
      (sum, trx) => sum + trx.transaction_items.reduce((s: number, i: any) => s + i.quantity, 0),
      0
    )
    const avgTransaction = transactionCount > 0 ? totalSales / transactionCount : 0

    const costOfGoods = relevantTrx.reduce(
      (sum, trx) =>
        sum + trx.transaction_items.reduce((s: number, i: any) => s + i.products.purchase_price * i.quantity, 0),
      0
    )

    const totalExpenses = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0)
    const grossProfit = totalSales - costOfGoods

    // Bucketing grafik: harian kalau rentangnya pendek (hari ini/bulan/kustom singkat), bulanan kalau panjang (tahun/semua)
    let chartData: { label: string; sales: number }[] = []
    const spanDays = start && end ? (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) : 366

    if (start && end && spanDays <= 31) {
      const days = Math.max(1, Math.round(spanDays) + 1)
      chartData = Array.from({ length: days }).map((_, i) => {
        const day = new Date(start)
        day.setDate(day.getDate() + i)
        const dayStr = day.toISOString().split('T')[0]
        const daySales = relevantTrx
          .filter((trx) => trx.created_at.startsWith(dayStr))
          .reduce((sum, trx) => sum + trx.transaction_items.reduce((s: number, i2: any) => s + i2.subtotal, 0), 0)
        return { label: String(day.getDate()), sales: daySales }
      })
    } else {
      const yearRef = start ? start.getFullYear() : new Date().getFullYear()
      chartData = Array.from({ length: 12 }).map((_, i) => {
        const monthSales = relevantTrx
          .filter((trx) => {
            const d = new Date(trx.created_at)
            return d.getMonth() === i && (start ? d.getFullYear() === yearRef : true)
          })
          .reduce((sum, trx) => sum + trx.transaction_items.reduce((s: number, i2: any) => s + i2.subtotal, 0), 0)
        return { label: new Date(2000, i, 1).toLocaleDateString('id-ID', { month: 'short' }), sales: monthSales }
      })
    }

    const productSales: Record<string, number> = {}
    relevantTrx.forEach((trx) => {
      trx.transaction_items.forEach((item: any) => {
        productSales[item.products.name] = (productSales[item.products.name] ?? 0) + item.quantity
      })
    })
    const bestSellers = Object.entries(productSales)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)

    const transactionItemRows: TransactionItemRow[] = []
    relevantTrx.forEach((trx) => {
      trx.transaction_items.forEach((item: any) => {
        transactionItemRows.push({
          date: new Date(trx.created_at).toLocaleDateString('id-ID'),
          trx_number: trx.trx_number,
          product: item.products.name,
          category: item.products.category,
          qty: item.quantity,
          price: item.price_at_sale,
          subtotal: item.subtotal,
        })
      })
    })

    const expenseRows: ExpenseRow[] = (expenses ?? []).map((e) => ({
      date: new Date(e.expense_date).toLocaleDateString('id-ID'),
      description: e.description,
      category: e.category,
      amount: e.amount,
    }))

    setData({
      totalSales,
      transactionCount,
      totalItemsSold,
      avgTransaction,
      totalExpenses,
      costOfGoods,
      grossProfit,
      chartData,
      bestSellers,
      transactionItemRows,
      expenseRows,
      periodLabel: label,
    })
    setLoading(false)
  }, [filter, timeFilter, customFrom, customTo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading }
}