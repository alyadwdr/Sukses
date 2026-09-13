import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusinessFilter } from '@/context/BusinessFilterContext'
import { filterItemsByCategory } from '@/lib/categoryFilter'

export type IncomeChartPeriod = '7d' | '1m' | '1y'

interface IncomeTransactionRow {
  id: string
  trx_number: string
  created_at: string
  payment_method: string
  amount: number
}

interface IncomeData {
  chartData: { label: string; income: number }[]
  totalIncome: number
  cashIncome: number
  qrisIncome: number
  transactionRows: IncomeTransactionRow[]
}

const TRX_SELECT = `
  id, trx_number, created_at, payment_method,
  transaction_items ( quantity, subtotal, products ( category ) )
`

function amountFor(trx: any) {
  return trx.transaction_items.reduce((s: number, i: any) => s + i.subtotal, 0)
}

export function useIncomeData(period: IncomeChartPeriod) {
  const [data, setData] = useState<IncomeData | null>(null)
  const [loading, setLoading] = useState(true)
  const { filter } = useBusinessFilter()

  const fetchData = useCallback(async () => {
    setLoading(true)

    const now = new Date()
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

    const { data: transactions } = await supabase
      .from('transactions')
      .select(TRX_SELECT)
      .order('created_at', { ascending: false })

    const withFilteredItems = (transactions ?? [])
      .map((trx) => ({ ...trx, transaction_items: filterItemsByCategory(trx.transaction_items as any, filter) }))
      .filter((trx) => trx.transaction_items.length > 0)

    const totalIncome = withFilteredItems.reduce((sum, trx) => sum + amountFor(trx), 0)
    const cashIncome = withFilteredItems
      .filter((t) => t.payment_method === 'cash')
      .reduce((sum, trx) => sum + amountFor(trx), 0)
    const qrisIncome = withFilteredItems
      .filter((t) => t.payment_method === 'qris')
      .reduce((sum, trx) => sum + amountFor(trx), 0)

    const inRange = withFilteredItems.filter((trx) => {
      const d = new Date(trx.created_at)
      return d >= rangeStart && d <= rangeEnd
    })

    let chartData: { label: string; income: number }[] = []

    if (period === '7d') {
      chartData = Array.from({ length: 7 }).map((_, i) => {
        const day = new Date(rangeStart)
        day.setDate(day.getDate() + i)
        const dayStr = day.toISOString().split('T')[0]
        const income = inRange.filter((t) => t.created_at.startsWith(dayStr)).reduce((s, t) => s + amountFor(t), 0)
        return { label: day.toLocaleDateString('id-ID', { weekday: 'short' }), income }
      })
    } else if (period === '1m') {
      const days = rangeEnd.getDate()
      chartData = Array.from({ length: days }).map((_, i) => {
        const day = new Date(rangeStart)
        day.setDate(i + 1)
        const dayStr = day.toISOString().split('T')[0]
        const income = inRange.filter((t) => t.created_at.startsWith(dayStr)).reduce((s, t) => s + amountFor(t), 0)
        return { label: String(i + 1), income }
      })
    } else {
      chartData = Array.from({ length: 12 }).map((_, i) => {
        const income = inRange
          .filter((t) => {
            const d = new Date(t.created_at)
            return d.getMonth() === i && d.getFullYear() === rangeStart.getFullYear()
          })
          .reduce((s, t) => s + amountFor(t), 0)
        const label = new Date(rangeStart.getFullYear(), i, 1).toLocaleDateString('id-ID', { month: 'short' })
        return { label, income }
      })
    }

    const transactionRows: IncomeTransactionRow[] = withFilteredItems.slice(0, 100).map((trx) => ({
      id: trx.id,
      trx_number: trx.trx_number,
      created_at: trx.created_at,
      payment_method: trx.payment_method,
      amount: amountFor(trx),
    }))

    setData({ chartData, totalIncome, cashIncome, qrisIncome, transactionRows })
    setLoading(false)
  }, [filter, period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading }
}