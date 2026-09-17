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

/** Jam WIB saat ini dalam format HH:mm:ss. */
export function jakartaTimeString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: JAKARTA_TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

/**
 * Bikin timestamp untuk tanggal WIB tertentu, jam-nya ikut jam WIB sekarang.
 * Dipakai saat menyimpan transaksi biar tanggalnya nggak geser di perangkat zona waktu lain.
 */
export function jakartaTimestampOnDate(dateStr: string): Date {
  return new Date(`${dateStr}T${jakartaTimeString()}+07:00`)
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

export type JakartaRangeFilter = 'all' | 'today' | 'month' | 'year' | 'custom'

/** Rentang waktu WIB untuk filter Semua/Hari Ini/Bulan Ini/Tahun Ini/Kustom. */
export function jakartaRangeFor(
  filter: JakartaRangeFilter,
  customFrom?: string,
  customTo?: string
): { start: Date | null; end: Date | null } {
  if (filter === 'today') return { start: startOfJakartaDay(), end: endOfJakartaDay() }
  if (filter === 'month') return { start: startOfJakartaMonth(), end: endOfJakartaMonth() }
  if (filter === 'year') return { start: startOfJakartaYear(), end: endOfJakartaYear() }
  if (filter === 'custom' && customFrom && customTo) {
    return {
      start: new Date(`${customFrom}T00:00:00+07:00`),
      end: new Date(`${customTo}T23:59:59.999+07:00`),
    }
  }
  return { start: null, end: null }
}