import { useReportsData } from '@/features/reports/useReportsData'
import PageHeader from '@/components/PageHeader/PageHeader'
import Card from '@/components/Card/Card'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

function ReportCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={{ boxShadow: 'var(--shadow-card)', marginBottom: 24 }}>
      <h3 style={{ marginBottom: 16 }}>{title}</h3>
      {children}
    </Card>
  )
}

export default function Reports() {
  const { data, loading } = useReportsData()

  if (loading || !data) return <p>Loading...</p>

  return (
    <div>
      <PageHeader title="Reports" />

      <ReportCard title="Sales Report">
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Total Sales</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{formatRupiah(data.totalSales)}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Transactions</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{data.transactionCount}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Items Sold</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{data.totalItemsSold}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Avg. Transaction</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{formatRupiah(data.avgTransaction)}</div>
          </div>
        </div>
      </ReportCard>

      <ReportCard title="Expense Report">
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Total Expenses</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{formatRupiah(data.totalExpenses)}</div>
      </ReportCard>

      <ReportCard title="Profit Report">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Sales</span>
            <span>{formatRupiah(data.totalSales)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Cost of Goods</span>
            <span>{formatRupiah(data.costOfGoods)}</span>
          </div>
          <hr style={{ borderColor: 'var(--color-border)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Gross Profit</span>
            <span>{formatRupiah(data.grossProfit)}</span>
          </div>
        </div>
      </ReportCard>

      <ReportCard title="Best-Selling Products">
        {data.bestSellers.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No sales yet</p>}
        {data.bestSellers.map((item) => (
          <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span>{item.name}</span>
            <span>{item.qty} sold</span>
          </div>
        ))}
      </ReportCard>
    </div>
  )
}