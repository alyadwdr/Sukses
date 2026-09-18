import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Link } from 'react-router-dom'
import { ThumbsUp } from 'lucide-react'
import { useDashboardData, type ChartPeriod } from '@/features/dashboard/useDashboardData'
import Card from '@/components/Card/Card'
import PageTopBar from '@/components/PageTopBar/PageTopBar'
import BusinessFilterTabs from '@/components/BusinessFilterTabs/BusinessFilterTabs'
import Loading from '@/components/Loading/Loading'
import { useChartColors } from '@/lib/chartColors'
import { useIsMobile } from '@/hooks/useIsMobile'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

const periodOptions: { label: string; value: ChartPeriod }[] = [
  { label: '7D', value: '7d' },
  { label: '1M', value: '1m' },
  { label: '1Y', value: '1y' },
]

const linkStyle = {
  color: 'var(--color-primary-text)',
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
}

function PeriodSwitch({ period, onChange }: { period: ChartPeriod; onChange: (p: ChartPeriod) => void }) {
  return (
    <div style={{ display: 'inline-flex', padding: 4, borderRadius: 20, background: 'var(--color-surface-muted)' }}>
      {periodOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
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
  )
}

export default function Dashboard() {
  const [period, setPeriod] = useState<ChartPeriod>('7d')
  const { data, loading } = useDashboardData(period)
  const chart = useChartColors()
  const donutColors = chart.donut
  const isMobile = useIsMobile()

  if (loading || !data) return <Loading />

  if (isMobile) {
    const recentTransactions = data.recentTransactions.slice(0, 3)
    const lowStockProducts = data.lowStockProducts.slice(0, 3)
    const bestSellers = data.bestSellers.slice(0, 3)

    return (
      <div>
        <PageTopBar title="Beranda" />

        <div style={{ marginBottom: 16 }}>
          <BusinessFilterTabs />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'stretch' }}>
          <Card
            style={{
              flex: 2,
              boxShadow: 'var(--shadow-card)',
              background: 'var(--color-inverse-surface)',
              borderColor: 'transparent',
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--color-on-inverse-muted)', marginBottom: 6 }}>Laba Bersih Hari Ini</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-accent-on-inverse)' }}>
              {formatRupiah(data.todayNetProfit)}
            </div>
          </Card>
          <Card style={{ flex: 1, boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>Transaksi</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{data.todayTransactionCount}</div>
          </Card>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <Card style={{ flex: 1, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>Penjualan</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{formatRupiah(data.todaySales)}</div>
          </Card>
          <Card style={{ flex: 1, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>Pengeluaran</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{formatRupiah(data.todayExpenses)}</div>
          </Card>
        </div>

        <Card style={{ boxShadow: 'var(--shadow-card)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ fontSize: 15 }}>Ringkasan Penjualan</h3>
            <PeriodSwitch period={period} onChange={setPeriod} />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.chartData}>
              <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={10} />
              <YAxis stroke="var(--color-text-muted)" fontSize={10} width={44} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}rb` : String(v))} />
              <Tooltip
                formatter={(value, name) => [formatRupiah(Number(value)), name === 'sales' ? 'Penjualan' : 'Pengeluaran']}
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text)' }}
              />
              <Bar dataKey="sales" fill={chart.sales} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill={chart.expenses} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {lowStockProducts.length === 0 ? (
          <Card
            style={{
              background: 'var(--color-accent)',
              borderColor: 'var(--color-accent-border)',
              boxShadow: 'var(--shadow-card)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ color: 'var(--color-on-accent)', marginBottom: 4, fontSize: 15 }}>Stok Menipis</h3>
              <p style={{ color: 'var(--color-on-accent-muted)', fontSize: 13 }}>Semua item stoknya masih aman.</p>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--color-accent-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ThumbsUp size={18} color="var(--color-on-accent)" />
            </div>
          </Card>
        ) : (
          <Card style={{ boxShadow: 'var(--shadow-card)', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15 }}>Stok Menipis</h3>
              <Link to="/dashboard/inventory" style={linkStyle}>
                Lihat Semua →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lowStockProducts.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>{p.name}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {p.stock} {p.unit}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card style={{ boxShadow: 'var(--shadow-card)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15 }}>Transaksi Terbaru</h3>
            <Link to="/dashboard/transactions" style={linkStyle}>
              Lihat Semua →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentTransactions.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Belum ada transaksi</p>}
            {recentTransactions.map((trx) => (
              <div key={trx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <div>
                  <div style={{ color: 'var(--color-primary-text)', fontWeight: 600 }}>{trx.trx_number}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                    {new Date(trx.created_at).toLocaleDateString('id-ID')} · {trx.itemCount} item
                  </div>
                </div>
                <span style={{ fontWeight: 700 }}>{formatRupiah(trx.total)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ marginBottom: 12, fontSize: 15 }}>Produk Terlaris</h3>
          {bestSellers.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Belum ada penjualan</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bestSellers.map((p, i) => (
                <div key={p.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{p.qty} terjual</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--color-surface-muted)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (p.qty / (bestSellers[0]?.qty || 1)) * 100)}%`,
                        background: donutColors[i % donutColors.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    )
  }

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
          <Card style={{ boxShadow: 'var(--shadow-card)', background: 'var(--color-inverse-surface)', borderColor: 'transparent' }}>
            <div style={{ fontSize: 13, color: 'var(--color-on-inverse-muted)', marginBottom: 6 }}>Laba Bersih</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-accent-on-inverse)' }}>
              {formatRupiah(data.todayNetProfit)}
            </div>
          </Card>
          <Card style={{ boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>Transaksi</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{data.todayTransactionCount} Total</div>
          </Card>
        </div>

        <Card style={{ flex: 1, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Ringkasan Penjualan</h3>
            <PeriodSwitch period={period} onChange={setPeriod} />
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data.chartData}>
              <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={11} />
              <YAxis
                stroke="var(--color-text-muted)"
                fontSize={12}
                tickFormatter={(value: number) => value.toLocaleString('id-ID')}
                width={70}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatRupiah(Number(value)),
                  name === 'sales' ? 'Penjualan' : name === 'expenses' ? 'Pengeluaran' : String(name),
                ]}
                labelFormatter={(label) => `Tanggal ${label}`}
                contentStyle={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  color: 'var(--color-text)',
                }}
              />
              <Bar dataKey="sales" fill={chart.sales} radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" fill={chart.expenses} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: chart.sales, display: 'inline-block' }} />
              Penjualan
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: chart.expenses, display: 'inline-block' }} />
              Pengeluaran
            </span>
          </div>
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
                <span style={{ color: 'var(--color-primary-text)', fontWeight: 600 }}>{trx.trx_number}</span>
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
              borderColor: 'var(--color-accent-border)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ color: 'var(--color-on-accent)', marginBottom: 6 }}>Stok Menipis</h3>
              <p style={{ color: 'var(--color-on-accent-muted)', fontSize: 14 }}>
                Semua item stoknya masih aman.
              </p>
            </div>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--color-accent-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ThumbsUp size={22} color="var(--color-on-accent)" />
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
                      <Cell key={i} fill={donutColors[i % donutColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} terjual`, name]}
                    contentStyle={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 10,
                      color: 'var(--color-text)',
                    }}
                  />
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
                        background: donutColors[i % donutColors.length],
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