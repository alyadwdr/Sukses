import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusinessFilter } from '@/context/BusinessFilterContext'
import { filterItemsByCategory } from '@/lib/categoryFilter'
import {
  jakartaDateString,
  jakartaDateOnly,
  endOfJakartaDay,
  startOfJakartaMonth,
  endOfJakartaMonth,
  startOfJakartaYear,
  endOfJakartaYear,
  addJakartaDays,
} from '@/lib/time'

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

    let rangeStart: Date
    let rangeEnd: Date

    if (period === '7d') {
      rangeStart = addJakartaDays(new Date(), -6)
      rangeEnd = endOfJakartaDay()
    } else if (period === '1m') {
      rangeStart = startOfJakartaMonth()
      rangeEnd = endOfJakartaMonth()
    } else {
      rangeStart = startOfJakartaYear()
      rangeEnd = endOfJakartaYear()
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
        const day = addJakartaDays(rangeStart, i)
        const dayStr = jakartaDateString(day)
        const income = inRange
          .filter((t) => jakartaDateString(new Date(t.created_at)) === dayStr)
          .reduce((s, t) => s + amountFor(t), 0)
        return { label: day.toLocaleDateString('id-ID', { weekday: 'short', timeZone: 'Asia/Jakarta' }), income }
      })
    } else if (period === '1m') {
      const daysInRange = Math.round((rangeEnd.getTime() - rangeStart.getTime() + 1) / (24 * 60 * 60 * 1000))
      chartData = Array.from({ length: daysInRange }).map((_, i) => {
        const day = addJakartaDays(rangeStart, i)
        const dayStr = jakartaDateString(day)
        const income = inRange
          .filter((t) => jakartaDateString(new Date(t.created_at)) === dayStr)
          .reduce((s, t) => s + amountFor(t), 0)
        return { label: String(i + 1), income }
      })
    } else {
      const yearRef = jakartaDateOnly(rangeStart).y
      chartData = Array.from({ length: 12 }).map((_, i) => {
        const income = inRange
          .filter((t) => {
            const { y, m } = jakartaDateOnly(new Date(t.created_at))
            return m - 1 === i && y === yearRef
          })
          .reduce((s, t) => s + amountFor(t), 0)
        const label = new Date(2000, i, 1).toLocaleDateString('id-ID', { month: 'short' })
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