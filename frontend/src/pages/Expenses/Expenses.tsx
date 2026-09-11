import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useExpenses } from '@/features/expenses/useExpenses'
import { useExpenseSummary } from '@/features/expenses/useExpenseSummary'
import AddExpenseForm from '@/features/expenses/AddExpenseForm'
import Card from '@/components/Card/Card'
import Modal from '@/components/Modal/Modal'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'var(--color-card)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
}

export default function Expenses() {
  const { expenses, loading, refetch } = useExpenses()
  const summary = useExpenseSummary(expenses)
  const [showForm, setShowForm] = useState(false)
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

  const chartData = useMemo(() => {
    const byCategory: Record<string, number> = {}
    filteredExpenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount
    })
    return Object.entries(byCategory).map(([category, total]) => ({ category, total }))
  }, [filteredExpenses])

  function handleFilter() {
    setAppliedFrom(dateFrom)
    setAppliedTo(dateTo)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: 'var(--color-text)' }}>Pengeluaran</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            borderRadius: 24,
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Tambah Pengeluaran
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
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
            <Card
              style={{
                boxShadow: 'var(--shadow-card)',
                flex: 1,
                background: 'var(--color-text)',
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: 6 }}>Tahun Ini</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-accent)' }}>{formatRupiah(summary.year)}</div>
            </Card>
          </div>

          <Card style={{ boxShadow: 'var(--shadow-card)', background: 'var(--color-accent)' }}>
            <h3 style={{ color: 'var(--color-text)', marginBottom: 16 }}>Rentang Tanggal</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
              <button
                onClick={handleFilter}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: 'none',
                  background: 'var(--color-text)',
                  color: '#fff',
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
          <Card style={{ boxShadow: 'var(--shadow-card)' }}>
            <h3 style={{ marginBottom: 16 }}>Grafik Total Pengeluaran</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="category" stroke="var(--color-text-muted)" fontSize={12} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                <Bar dataKey="total" fill="#95B1EE" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card style={{ boxShadow: 'var(--shadow-card)', padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <p style={{ padding: 20 }}>Memuat...</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Tanggal</th>
                    <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Deskripsi</th>
                    <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Kategori</th>
                    <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 14 }}>{new Date(e.expense_date).toLocaleDateString('id-ID')}</td>
                      <td style={{ padding: 14, color: 'var(--color-primary)', fontWeight: 600 }}>{e.description}</td>
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