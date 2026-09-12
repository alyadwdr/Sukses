const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000

export function nowInJakarta(): Date {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  return new Date(utcMs + JAKARTA_OFFSET_MS)
}

export function jakartaDateString(date: Date = new Date()): string {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60 * 1000
  const jakarta = new Date(utcMs + JAKARTA_OFFSET_MS)
  return jakarta.toISOString().split('T')[0]
}

export function startOfJakartaDay(date: Date = new Date()): Date {
  const dayStr = jakartaDateString(date)
  const [y, m, d] = dayStr.split('-').map(Number)
  // Bikin Date UTC yang mewakili 00:00 WIB (= 17:00 UTC hari sebelumnya)
  return new Date(Date.UTC(y, m - 1, d, -7, 0, 0, 0))
}

export function endOfJakartaDay(date: Date = new Date()): Date {
  const start = startOfJakartaDay(date)
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
}