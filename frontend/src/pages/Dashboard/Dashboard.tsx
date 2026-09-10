import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'
import { ThumbsUp } from 'lucide-react'
import { useDashboardData, type ChartPeriod } from '@/features/dashboard/useDashboardData'
import { useBusinessFilter } from '@/context/BusinessFilterContext'
import Card from '@/components/Card/Card'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

const periodOptions: { label: string; value: ChartPeriod }[] = [
  { label: '7D', value: '7d' },
  { label: '1M', value: '1m' },
  { label: '1Y', value: '1y' },
]

const filterOptions: { label: string; value: 'all' | 'plastik' | 'sembako' }[] = [
  { label: 'Sembako & Plastik', value: 'all' },
  { label: 'Plastik', value: 'plastik' },
  { label: 'Sembako', value: 'sembako' },
]

export default function Dashboard() {
  const [period, setPeriod] = useState<ChartPeriod>('7d')
  const { filter, setFilter } = useBusinessFilter()
  const { data, loading } = useDashboardData(period)

  if (loading || !data) return <p>Memuat...</p>

  return (
    <div>
      <h1 style={{ color: 'var(--color-text)', marginBottom: 16 }}>Dashboard</h1>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div
          style={{
            display: 'inline-flex',
            padding: 4,
            borderRadius: 12,
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: filter === opt.value ? 'var(--color-primary)' : 'transparent',
                color: filter === opt.value ? '#fff' : 'var(--color-text)',
                fontWeight: filter === opt.value ? 600 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 220 }}>
          <Card style={{ boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>Penjualan</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{formatRupiah(data.todaySales)}</div>
          </Card>
          <Card style={{ boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>Pengeluaran</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{formatRupiah(data.todayExpenses)}</div>
          </Card>
          <Card style={{ boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>Transaksi</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{data.todayTransactionCount} Total</div>
          </Card>
        </div>

        <Card style={{ flex: 1, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Ringkasan Penjualan</h3>
            <div style={{ display: 'inline-flex', padding: 4, borderRadius: 20, background: 'var(--color-bg)' }}>
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
                    background: period === opt.value ? 'var(--color-primary)' : 'transparent',
                    color: period === opt.value ? '#fff' : 'var(--color-text)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.chartData}>
              <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={12} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} />
              <Tooltip formatter={(value) => formatRupiah(Number(value))} />
              <Bar dataKey="sales" fill="#95B1EE" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <Card style={{ flex: 1, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3>Transaksi Terbaru</h3>
            <Link to="/dashboard/transactions" style={{ color: 'var(--color-primary)', fontSize: 14 }}>
              Lihat Semua →
            </Link>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.recentTransactions.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)' }}>Belum ada transaksi</p>
            )}
            {data.recentTransactions.map((trx) => (
              <div
                key={trx.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 14,
                }}
              >
                <span>{trx.trx_number}</span>
                <span>{new Date(trx.created_at).toLocaleDateString('id-ID')}</span>
                <span>{trx.itemCount} items</span>
                <span>{formatRupiah(trx.total)}</span>
              </div>
            ))}
          </div>
        </Card>

        {data.lowStockProducts.length === 0 ? (
          <Card
            style={{
              flex: 1,
              background: 'var(--color-accent)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ color: 'var(--color-text)', marginBottom: 6 }}>Stok Menipis</h3>
              <p style={{ color: 'var(--color-text)', opacity: 0.8, fontSize: 14 }}>
                Semua item stoknya masih aman.
              </p>
            </div>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ThumbsUp size={22} color="var(--color-text)" />
            </div>
          </Card>
        ) : (
          <Card style={{ flex: 1, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3>Stok Menipis</h3>
              <Link to="/dashboard/inventory" style={{ color: 'var(--color-primary)', fontSize: 14 }}>
                Lihat Inventori →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 14,
                  }}
                >
                  <span>{p.name}</span>
                  <span>
                    {p.stock} {p.unit}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}