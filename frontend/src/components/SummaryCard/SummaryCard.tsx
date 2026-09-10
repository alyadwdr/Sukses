import Card from '@/components/Card/Card'

interface SummaryCardProps {
  label: string
  value: string
}

export default function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <Card style={{ flex: 1, boxShadow: 'var(--shadow-card)' }}>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>{value}</div>
    </Card>
  )
}