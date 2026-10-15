import { jakartaDateString } from '@/lib/time'

export const EXPIRY_WARNING_DAYS = 30

export function daysUntil(date: string): number {
  const today = jakartaDateString()
  const diff = new Date(`${date}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime()
  return Math.round(diff / (24 * 60 * 60 * 1000))
}
