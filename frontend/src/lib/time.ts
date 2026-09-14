const JAKARTA_TZ = 'Asia/Jakarta'

/** Tanggal kalender (YYYY-MM-DD) versi WIB dari sebuah instant, berapa pun timezone perangkatnya. */
export function jakartaDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: JAKARTA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function jakartaDateOnly(date: Date = new Date()): { y: number; m: number; d: number } {
  const [y, m, d] = jakartaDateString(date).split('-').map(Number)
  return { y, m, d }
}

export function startOfJakartaDay(date: Date = new Date()): Date {
  const dayStr = jakartaDateString(date)
  return new Date(`${dayStr}T00:00:00+07:00`)
}

export function endOfJakartaDay(date: Date = new Date()): Date {
  const start = startOfJakartaDay(date)
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
}

export function addJakartaDays(refDate: Date, days: number): Date {
  const { y, m, d } = jakartaDateOnly(refDate)
  const base = new Date(Date.UTC(y, m - 1, d + days))
  return startOfJakartaDay(base)
}

export function startOfJakartaMonth(refDate: Date = new Date()): Date {
  const { y, m } = jakartaDateOnly(refDate)
  return new Date(`${y}-${String(m).padStart(2, '0')}-01T00:00:00+07:00`)
}

export function endOfJakartaMonth(refDate: Date = new Date()): Date {
  const { y, m } = jakartaDateOnly(refDate)
  const nextMonth = m === 12 ? 1 : m + 1
  const nextYear = m === 12 ? y + 1 : y
  const start = new Date(`${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00+07:00`)
  return new Date(start.getTime() - 1)
}

export function startOfJakartaYear(refDate: Date = new Date()): Date {
  const { y } = jakartaDateOnly(refDate)
  return new Date(`${y}-01-01T00:00:00+07:00`)
}

export function endOfJakartaYear(refDate: Date = new Date()): Date {
  const { y } = jakartaDateOnly(refDate)
  const start = new Date(`${y + 1}-01-01T00:00:00+07:00`)
  return new Date(start.getTime() - 1)
}