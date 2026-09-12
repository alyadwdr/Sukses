import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Link } from 'react-router-dom'
import { ThumbsUp } from 'lucide-react'
import { useDashboardData, type ChartPeriod } from '@/features/dashboard/useDashboardData'
import Card from '@/components/Card/Card'
import PageTopBar from '@/components/PageTopBar/PageTopBar'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

const periodOptions: { label: string; value: ChartPeriod }[] = [
  { label: '7D', value: '7d' },
  { label: '1M', value: '1m' },
  { label: '1Y', value: '1y' },
]

const DONUT_COLORS = ['#95B1EE', '#E7F1A8', '#364C84', '#B9CDF3', '#F0F6C8', '#6D89C4', '#D5E28E', '#28345C', '#AFC6F0', '#8FA9DE']

const linkStyle = { color: 'var(--color-primary)', fontSize: 14, textDecoration: 'none' }

export default function Dashboard() {
  const [period, setPeriod] = useState<ChartPeriod>('7d')
  const { data, loading } = useDashboardData(period)

  if (loading || !data) return <p>Memuat...</p>

  return (
    <div>
      <PageTopBar title="Dashboard" />

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
          <Card style={{ boxShadow: 'var(--shadow-card)', background: 'var(--color-text)' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Laba Bersih</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-accent)' }}>
              {formatRupiah(data.todayNetProfit)}
            </div>
          </Card>
        </div>

        <Card style={{ flex: 1, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
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

          <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#95B1EE', display: 'inline-block' }} />
              Penjualan
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-text)', display: 'inline-block' }} />
              Pengeluaran
            </span>
          </div>

          <ResponsiveContainer width="100%" height={360}>
  <BarChart data={data.chartData}>
    <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={11} />
    <YAxis
      stroke="var(--color-text-muted)"
      fontSize={12}
      tickFormatter={(value: number) => value.toLocaleString('id-ID')}
      width={70}
    />
    <Tooltip formatter={(value) => formatRupiah(Number(value))} />
    <Bar dataKey="sales" fill="#95B1EE" radius={[6, 6, 0, 0]} />
    <Bar dataKey="expenses" fill="#364C84" radius={[6, 6, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <Card style={{ flex: 1, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3>Transaksi Terbaru</h3>
            <Link to="/dashboard/transactions" style={linkStyle}>
              Lihat Semua →
            </Link>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.recentTransactions.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)' }}>Belum ada transaksi</p>
            )}
            {data.recentTransactions.map((trx) => (
              <div
                key={trx.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 90px 60px 100px',
                  gap: 8,
                  fontSize: 13,
                  alignItems: 'center',
                }}
              >
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{trx.trx_number}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{new Date(trx.created_at).toLocaleDateString('id-ID')}</span>
                <span style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>{trx.itemCount} item</span>
                <span style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(trx.total)}</span>
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
              <Link to="/dashboard/inventory" style={linkStyle}>
                Lihat Inventori →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 90px',
                    fontSize: 13,
                  }}
                >
                  <span>{p.name}</span>
                  <span style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>
                    {p.stock} {p.unit}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card style={{ flex: 1, boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ marginBottom: 8 }}>Produk Terlaris</h3>
          {data.bestSellers.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Belum ada penjualan</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={data.bestSellers} dataKey="qty" nameKey="name" innerRadius={42} outerRadius={65} paddingAngle={2}>
                    {data.bestSellers.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 100, overflowY: 'auto', marginTop: 8 }}>
                {data.bestSellers.map((p, i) => (
                  <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '10px 1fr 40px', gap: 8, alignItems: 'center', fontSize: 12 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: DONUT_COLORS[i % DONUT_COLORS.length],
                      }}
                    />
                    <span>{p.name}</span>
                    <span style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>{p.qty}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}