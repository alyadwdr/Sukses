import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useExpenses } from '@/features/expenses/useExpenses'
import { useExpenseSummary } from '@/features/expenses/useExpenseSummary'
import AddExpenseForm from '@/features/expenses/AddExpenseForm'
import Card from '@/components/Card/Card'
import Modal from '@/components/Modal/Modal'
import PageTopBar from '@/components/PageTopBar/PageTopBar'
import Loading from '@/components/Loading/Loading'
import { useChartColors } from '@/lib/chartColors'
import { jakartaDateString, jakartaDateOnly, addJakartaDays, startOfJakartaMonth, endOfJakartaMonth, startOfJakartaYear } from '@/lib/time'
import { Receipt } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

type ChartPeriod = '7d' | '1m' | '1y'

const periodOptions: { label: string; value: ChartPeriod }[] = [
  { label: '7D', value: '7d' },
  { label: '1M', value: '1m' },
  { label: '1Y', value: '1y' },
]

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--color-accent-border)',
  background: 'var(--color-accent-control)',
  color: 'var(--color-accent-control-text)',
  fontFamily: 'var(--font-body)',
}

export default function Expenses() {
  const { expenses, loading, refetch } = useExpenses()
  const summary = useExpenseSummary(expenses)
  const chart = useChartColors()
  const isMobile = useIsMobile()
  const [showForm, setShowForm] = useState(false)
  const [period, setPeriod] = useState<ChartPeriod>('7d')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [appliedFrom, setAppliedFrom] = useState('')
  const [appliedTo, setAppliedTo] = useState('')

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (appliedFrom && e.expense_date < appliedFrom) return false
      if (appliedTo && e.expense_date > appliedTo) return false
      return true
    })
  }, [expenses, appliedFrom, appliedTo])

  const donutData = useMemo(() => {
    const byCategory: Record<string, number> = {}
    filteredExpenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount
    })
    return Object.entries(byCategory).map(([category, total]) => ({ category, total }))
  }, [filteredExpenses])

  const totalChartData = useMemo(() => {
    if (period === '7d') {
      const rangeStart = addJakartaDays(new Date(), -6)
      return Array.from({ length: 7 }).map((_, i) => {
        const day = addJakartaDays(rangeStart, i)
        const dayStr = jakartaDateString(day)
        const total = expenses.filter((e) => e.expense_date === dayStr).reduce((s, e) => s + e.amount, 0)
        return { label: day.toLocaleDateString('id-ID', { weekday: 'short', timeZone: 'Asia/Jakarta' }), total }
      })
    }

    if (period === '1m') {
      const rangeStart = startOfJakartaMonth()
      const rangeEnd = endOfJakartaMonth()
      const daysInRange = Math.round((rangeEnd.getTime() - rangeStart.getTime() + 1) / (24 * 60 * 60 * 1000))
      return Array.from({ length: daysInRange }).map((_, i) => {
        const day = addJakartaDays(rangeStart, i)
        const dayStr = jakartaDateString(day)
        const total = expenses.filter((e) => e.expense_date === dayStr).reduce((s, e) => s + e.amount, 0)
        return { label: String(i + 1), total }
      })
    }

    const yearRef = jakartaDateOnly(startOfJakartaYear()).y
    return Array.from({ length: 12 }).map((_, i) => {
      const total = expenses
        .filter((e) => {
          const { y, m } = jakartaDateOnly(new Date(e.expense_date))
          return m - 1 === i && y === yearRef
        })
        .reduce((s, e) => s + e.amount, 0)
      const label = new Date(2000, i, 1).toLocaleDateString('id-ID', { month: 'short' })
      return { label, total }
    })
  }, [expenses, period])

  function handleFilter() {
    setAppliedFrom(dateFrom)
    setAppliedTo(dateTo)
  }

  const periodTotal = totalChartData.reduce((sum, d) => sum + d.total, 0)

  const periodRangeLabel = useMemo(() => {
    if (period === '1y') {
      return String(jakartaDateOnly(new Date()).y)
    }
    if (period === '1m') {
      return startOfJakartaMonth().toLocaleDateString('id-ID', { month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
    }
    const start = addJakartaDays(new Date(), -6)
    const end = new Date()
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
    const startLabel = sameMonth
      ? start.toLocaleDateString('id-ID', { day: 'numeric', timeZone: 'Asia/Jakarta' })
      : start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' })
    const endLabel = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
    return `${startLabel}–${endLabel}`
  }, [period])

  if (isMobile) {
    return (
      <div>
        <PageTopBar title="Pengeluaran" onMobileAdd={() => setShowForm(true)} />

        <div style={{ background: 'var(--color-inverse-surface)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--color-on-inverse-muted)', marginBottom: 6 }}>Total Pengeluaran</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-on-inverse)', marginBottom: 6 }}>{formatRupiah(periodTotal)}</div>
          <div style={{ fontSize: 12, color: 'var(--color-on-inverse-muted)' }}>Periode {periodRangeLabel}</div>
        </div>

        <div style={{ display: 'inline-flex', padding: 4, borderRadius: 999, background: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', marginBottom: 20 }}>
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              style={{
                padding: '7px 16px',
                borderRadius: 999,
                border: 'none',
                fontSize: 13,
                cursor: 'pointer',
                background: period === opt.value ? 'var(--color-primary-solid)' : 'transparent',
                color: period === opt.value ? 'var(--color-on-primary)' : 'var(--color-text)',
                fontWeight: period === opt.value ? 700 : 400,
              }}
            >
              {opt.value === '7d' ? '7 Hari' : opt.value === '1m' ? '1 Bln' : '1 Thn'}
            </button>
          ))}
        </div>

        <Card style={{ boxShadow: 'var(--shadow-card)', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Per Kategori</h3>
          {donutData.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Belum ada data</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={donutData} dataKey="total" nameKey="category" innerRadius={40} outerRadius={62} paddingAngle={2}>
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={chart.donut[i % chart.donut.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {donutData.map((d, i) => (
                  <div key={d.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: chart.donut[i % chart.donut.length] }} />
                      {d.category}
                    </span>
                    <span style={{ fontWeight: 700 }}>{formatRupiah(d.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {loading ? (
          <Loading />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {filteredExpenses.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Belum ada pengeluaran</p>}
            {filteredExpenses.map((e) => (
              <div
                key={e.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 14,
                  borderRadius: 14,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-card)',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'var(--color-danger-bg)',
                    color: 'var(--color-danger-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Receipt size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{e.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {e.category} · {new Date(e.expense_date).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}
                  </div>
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{formatRupiah(e.amount)}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowForm(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: 16,
            borderRadius: 14,
            border: 'none',
            background: 'var(--color-primary-solid)',
            color: 'var(--color-on-primary)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Plus size={18} /> Tambah Pengeluaran
        </button>

        {showForm && (
          <Modal onClose={() => setShowForm(false)}>
            <AddExpenseForm
              onSuccess={() => {
                setShowForm(false)
                refetch()
              }}
              onCancel={() => setShowForm(false)}
            />
          </Modal>
        )}
      </div>
    )
  }

  return (
    <div>
      <PageTopBar
        title="Pengeluaran"
        showFilter={false}
        action={
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 24,
              background: 'var(--color-primary-solid)',
              color: 'var(--color-on-primary)',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Tambah Pengeluaran
          </button>
        }
      />

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Hari Ini</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatRupiah(summary.today)}</div>
            </Card>
            <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Minggu Ini</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatRupiah(summary.week)}</div>
            </Card>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Bulan Ini</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatRupiah(summary.month)}</div>
            </Card>
            <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1, background: 'var(--color-inverse-surface)', borderColor: 'transparent' }}>
              <div style={{ fontSize: 12, color: 'var(--color-on-inverse-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Tahun Ini</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-accent-on-inverse)' }}>{formatRupiah(summary.year)}</div>
            </Card>
          </div>

          <Card style={{ boxShadow: 'var(--shadow-card)', background: 'var(--color-accent)', borderColor: 'var(--color-accent-border)' }}>
            <h3 style={{ color: 'var(--color-on-accent)', marginBottom: 16 }}>Rentang Tanggal</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
              <button
                onClick={handleFilter}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: 'none',
                  background: 'var(--color-inverse-surface)',
                  color: 'var(--color-on-inverse)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Filter Data
              </button>
            </div>
          </Card>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 20 }}>
            <Card style={{ boxShadow: 'var(--shadow-card)', flex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3>Total Pengeluaran</h3>
                <div style={{ display: 'inline-flex', padding: 4, borderRadius: 20, background: 'var(--color-surface-muted)' }}>
                  {periodOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPeriod(opt.value)}
                      style={{
                        padding: '4px 14px',
                        borderRadius: 20,
                        border: 'none',
                        fontSize: 13,
                        cursor: 'pointer',
                        background: period === opt.value ? 'var(--color-primary-solid)' : 'transparent',
                        color: period === opt.value ? 'var(--color-on-primary)' : 'var(--color-text)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={totalChartData}>
                  <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={11} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(v: number) => v.toLocaleString('id-ID')} width={70} />
                  <Tooltip
                    formatter={(value) => formatRupiah(Number(value))}
                    contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text)' }}
                  />
                  <Bar dataKey="total" fill={chart.sales} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1 }}>
              <h3 style={{ marginBottom: 8 }}>Per Kategori</h3>
              {donutData.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Belum ada data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={donutData} dataKey="total" nameKey="category" innerRadius={38} outerRadius={58} paddingAngle={2}>
                        {donutData.map((_, i) => (
                          <Cell key={i} fill={chart.donut[i % chart.donut.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatRupiah(Number(value))}
                        contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, maxHeight: 90, overflowY: 'auto' }}>
                    {donutData.map((d, i) => (
                      <div key={d.category} style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto', gap: 8, alignItems: 'center', fontSize: 12 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: chart.donut[i % chart.donut.length] }} />
                        <span>{d.category}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>{formatRupiah(d.total)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>

          <Card style={{ boxShadow: 'var(--shadow-card)', padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <Loading />
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-divider)' }}>
                    <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Tanggal</th>
                    <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Deskripsi</th>
                    <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Kategori</th>
                    <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                      <td style={{ padding: 14 }}>{new Date(e.expense_date).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
                      <td style={{ padding: 14, color: 'var(--color-primary-text)', fontWeight: 600 }}>{e.description}</td>
                      <td style={{ padding: 14 }}>{e.category}</td>
                      <td style={{ padding: 14, fontWeight: 700 }}>{formatRupiah(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <AddExpenseForm
            onSuccess={() => {
              setShowForm(false)
              refetch()
            }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  )
}