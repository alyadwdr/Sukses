import { TrendingUp, TrendingDown, Coins, FileText, FileSpreadsheet } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useReportsData } from '@/features/reports/useReportsData'
import BusinessFilterTabs from '@/components/BusinessFilterTabs/BusinessFilterTabs'
import Card from '@/components/Card/Card'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

function IconBadge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: bg,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  )
}

export default function Reports() {
  const { data, loading } = useReportsData()

  if (loading || !data) return <p>Memuat...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <h1 style={{ color: 'var(--color-text)' }}>Laporan Bisnis</h1>
        <BusinessFilterTabs />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 20,
              border: '1px solid var(--color-border)',
              background: 'var(--color-card)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            <FileText size={15} /> PDF
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 20,
              border: '1px solid var(--color-border)',
              background: 'var(--color-card)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <IconBadge bg="rgba(149,177,238,0.2)" color="var(--color-primary)">
              <TrendingUp size={18} />
            </IconBadge>
            <h3 style={{ fontSize: 15 }}>Laporan Penjualan</h3>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>{formatRupiah(data.totalSales)}</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Transaksi</div>
              <div style={{ fontWeight: 600 }}>{data.transactionCount}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Item Terjual</div>
              <div style={{ fontWeight: 600 }}>{data.totalItemsSold}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Rata-rata</div>
              <div style={{ fontWeight: 600 }}>{formatRupiah(data.avgTransaction)}</div>
            </div>
          </div>
        </Card>

        <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <IconBadge bg="var(--color-accent)" color="var(--color-text)">
              <Coins size={18} />
            </IconBadge>
            <h3 style={{ fontSize: 15 }}>Laporan Laba</h3>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 16 }}>
            {formatRupiah(data.grossProfit)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Total Penjualan</span>
            <span style={{ fontWeight: 600 }}>{formatRupiah(data.totalSales)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Modal Barang</span>
            <span style={{ fontWeight: 600, color: '#c0392b' }}>-{formatRupiah(data.costOfGoods)}</span>
          </div>
        </Card>

        <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1, minWidth: 260, background: 'var(--color-text)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <IconBadge bg="rgba(255,255,255,0.15)" color="#fff">
              <TrendingDown size={18} />
            </IconBadge>
            <h3 style={{ fontSize: 15, color: '#fff' }}>Laporan Pengeluaran</h3>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
            {formatRupiah(data.totalExpenses)}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
            Total pengeluaran operasional untuk periode ini.
          </p>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <Card style={{ boxShadow: 'var(--shadow-card)', flex: 2, minWidth: 320 }}>
          <h3 style={{ marginBottom: 16 }}>Tren Pendapatan</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.chartData}>
              <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={11} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} />
              <Tooltip formatter={(value) => formatRupiah(Number(value))} />
              <Bar dataKey="sales" fill="#95B1EE" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1, minWidth: 260 }}>
          <h3 style={{ marginBottom: 16 }}>Produk Terlaris</h3>
          {data.bestSellers.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Belum ada penjualan</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.bestSellers.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--color-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    flexShrink: 0,
                  }}
                >
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ flex: 1, fontWeight: 600 }}>{item.name}</span>
                <span
                  style={{
                    fontSize: 12,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: 'rgba(149,177,238,0.2)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {item.qty} terjual
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}