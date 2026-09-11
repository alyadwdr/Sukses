import { useMemo } from 'react'
import type { Expense } from '@/types/expense'

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function useExpenseSummary(expenses: Expense[]) {
  return useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const weekStartStr = startOfWeek(now).toISOString().split('T')[0]
    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const yearStartStr = `${now.getFullYear()}-01-01`

    const today = expenses.filter((e) => e.expense_date === todayStr).reduce((s, e) => s + e.amount, 0)
    const week = expenses.filter((e) => e.expense_date >= weekStartStr).reduce((s, e) => s + e.amount, 0)
    const month = expenses.filter((e) => e.expense_date >= monthStartStr).reduce((s, e) => s + e.amount, 0)
    const year = expenses.filter((e) => e.expense_date >= yearStartStr).reduce((s, e) => s + e.amount, 0)

    return { today, week, month, year }
  }, [expenses])
}