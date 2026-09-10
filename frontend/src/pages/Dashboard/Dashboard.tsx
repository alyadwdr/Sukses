import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useDashboardData } from '@/features/dashboard/useDashboardData'
import SummaryCard from '@/components/SummaryCard/SummaryCard'
import PageHeader from '@/components/PageHeader/PageHeader'
import Card from '@/components/Card/Card'
import { Link } from 'react-router-dom'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

export default function Dashboard() {
  const { data, loading } = useDashboardData()

  if (loading || !data) return <p>Loading...</p>

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <SummaryCard label="Today's Sales" value={formatRupiah(data.todaySales)} />
        <SummaryCard label="Today's Expenses" value={formatRupiah(data.todayExpenses)} />
        <SummaryCard label="Today's Transactions" value={`${data.todayTransactionCount} Transactions`} />
      </div>

      <Card style={{ boxShadow: 'var(--shadow-card)', marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Sales Overview (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatRupiah(Number(value))} />
            <Line type="monotone" dataKey="sales" stroke="#95B1EE" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: 'flex', gap: 24 }}>
        <Card style={{ flex: 1, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3>Recent Transactions</h3>
            <Link to="/dashboard/transactions" style={{ color: 'var(--color-primary)' }}>
              View All →
            </Link>
          </div>
          {data.recentTransactions.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)' }}>No transactions yet</p>
          )}
          {data.recentTransactions.map((trx) => (
            <div
              key={trx.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span>{trx.trx_number}</span>
              <span>{new Date(trx.created_at).toLocaleDateString('id-ID')}</span>
              <span>{trx.itemCount} items</span>
              <span>{formatRupiah(trx.total)}</span>
            </div>
          ))}
        </Card>

        <Card style={{ flex: 1, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3>Low Stock</h3>
            <Link to="/dashboard/inventory" style={{ color: 'var(--color-primary)' }}>
              View Inventory →
            </Link>
          </div>
          {data.lowStockProducts.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)' }}>All stock levels are good</p>
          )}
          {data.lowStockProducts.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span>{p.name}</span>
              <span>
                {p.stock} {p.unit}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}