import { useIncomeData } from '@/features/income/useIncomeData'
import PageHeader from '@/components/PageHeader/PageHeader'
import Card from '@/components/Card/Card'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

export default function Income() {
  const { totalIncome, loading } = useIncomeData()

  return (
    <div>
      <PageHeader title="Income" />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Card style={{ boxShadow: 'var(--shadow-card)', maxWidth: 320 }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Total Income
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>
            {formatRupiah(totalIncome)}
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Sales</span>
              <span style={{ fontWeight: 600 }}>{formatRupiah(totalIncome)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}