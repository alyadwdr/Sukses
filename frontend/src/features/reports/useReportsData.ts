import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusinessFilter } from '@/context/BusinessFilterContext'

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
}

export function useReportsData() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { filter } = useBusinessFilter()

  const fetchData = useCallback(async () => {
    setLoading(true)

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const { data: transactions } = await supabase
      .from('transactions')
      .select(`
        id, total, created_at,
        transaction_items ( quantity, subtotal, products ( name, category, purchase_price ) )
      `)
      .gte('created_at', monthStart.toISOString())

    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, expense_date')
      .gte('expense_date', monthStart.toISOString().split('T')[0])

    const relevantTrx = (transactions ?? []).filter((trx) => {
      if (filter === 'all') return true
      return trx.transaction_items.some((item: any) => item.products?.category === filter)
    })

    const totalSales = relevantTrx.reduce((sum, trx) => sum + trx.total, 0)
    const transactionCount = relevantTrx.length
    const totalItemsSold = relevantTrx.reduce(
      (sum, trx) => sum + trx.transaction_items.reduce((s: number, i: any) => s + i.quantity, 0),
      0
    )
    const avgTransaction = transactionCount > 0 ? totalSales / transactionCount : 0

    const costOfGoods = relevantTrx.reduce(
      (sum, trx) =>
        sum +
        trx.transaction_items.reduce(
          (s: number, i: any) => s + i.products.purchase_price * i.quantity,
          0
        ),
      0
    )

    const totalExpenses = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0)
    const grossProfit = totalSales - costOfGoods

    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
    const chartData = Array.from({ length: daysInMonth }).map((_, i) => {
      const day = new Date(monthStart)
      day.setDate(i + 1)
      const dayStr = day.toISOString().split('T')[0]
      const daySales = relevantTrx
        .filter((trx) => trx.created_at.startsWith(dayStr))
        .reduce((sum, trx) => sum + trx.total, 0)
      return { label: String(i + 1), sales: daySales }
    })

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
    })
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading }
}