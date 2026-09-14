import { useMemo } from 'react'
import type { Expense } from '@/types/expense'
import { jakartaDateString, jakartaDateOnly } from '@/lib/time'

function jakartaWeekStartStr(): string {
  const { y, m, d } = jakartaDateOnly()
  const base = new Date(Date.UTC(y, m - 1, d))
  const day = base.getUTCDay()
  const diff = day === 0 ? 6 : day - 1
  base.setUTCDate(base.getUTCDate() - diff)
  return jakartaDateString(base)
}

export function useExpenseSummary(expenses: Expense[]) {
  return useMemo(() => {
    const todayStr = jakartaDateString()
    const weekStartStr = jakartaWeekStartStr()
    const { y } = jakartaDateOnly()
    const monthStartStr = `${jakartaDateString().slice(0, 7)}-01`
    const yearStartStr = `${y}-01-01`

    const today = expenses.filter((e) => e.expense_date === todayStr).reduce((s, e) => s + e.amount, 0)
    const week = expenses.filter((e) => e.expense_date >= weekStartStr).reduce((s, e) => s + e.amount, 0)
    const month = expenses.filter((e) => e.expense_date >= monthStartStr).reduce((s, e) => s + e.amount, 0)
    const year = expenses.filter((e) => e.expense_date >= yearStartStr).reduce((s, e) => s + e.amount, 0)

    return { today, week, month, year }
  }, [expenses])
}