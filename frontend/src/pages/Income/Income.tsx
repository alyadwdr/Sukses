import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, QrCode } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useIncomeData, type IncomeChartPeriod } from '@/features/income/useIncomeData'
import Card from '@/components/Card/Card'
import PageTopBar from '@/components/PageTopBar/PageTopBar'
import Loading from '@/components/Loading/Loading'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

const periodOptions: { label: string; value: IncomeChartPeriod }[] = [
  { label: '7D', value: '7d' },
  { label: '1M', value: '1m' },
  { label: '1Y', value: '1y' },
]

export default function Income() {
  const [period, setPeriod] = useState<IncomeChartPeriod>('7d')
  const { data, loading } = useIncomeData(period)

  if (loading || !data) return <Loading />

  return (
    <div>
      <PageTopBar title="Pemasukan" />

      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        <Card style={{ boxShadow: 'var(--shadow-card)', background: 'var(--color-accent)', flex: 1.4, minWidth: 240 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text)', opacity: 0.7, textTransform: 'uppercase', marginBottom: 8 }}>
            Total Pemasukan
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)' }}>{formatRupiah(data.totalIncome)}</div>
        </Card>

        <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Banknote size={16} color="var(--color-text-muted)" />
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Pemasukan Tunai</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{formatRupiah(data.cashIncome)}</div>
        </Card>

        <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <QrCode size={16} color="var(--color-text-muted)" />
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Pemasukan QRIS</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{formatRupiah(data.qrisIncome)}</div>
        </Card>
      </div>

      <Card style={{ boxShadow: 'var(--shadow-card)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Grafik Pemasukan</h3>
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
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.chartData}>
            <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={11} />
            <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(v: number) => v.toLocaleString('id-ID')} width={70} />
            <Tooltip
              formatter={(value) => formatRupiah(Number(value))}
              contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text)' }}
            />
            <Bar dataKey="income" fill="#95B1EE" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card style={{ boxShadow: 'var(--shadow-card)', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>No. Struk</th>
              <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Tanggal</th>
              <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Metode</th>
              <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {data.transactionRows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 14 }}>
                  <Link
                    to={`/dashboard/transactions?highlight=${encodeURIComponent(row.trx_number)}`}
                    style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    {row.trx_number}
                  </Link>
                </td>
                <td style={{ padding: 14 }}>{new Date(row.created_at).toLocaleDateString('id-ID')}</td>
                <td style={{ padding: 14, textTransform: 'uppercase', fontSize: 12, color: 'var(--color-text-muted)' }}>
                  {row.payment_method === 'cash' ? 'Tunai' : row.payment_method}
                </td>
                <td style={{ padding: 14, fontWeight: 700 }}>{formatRupiah(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}