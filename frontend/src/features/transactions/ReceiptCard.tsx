import Card from '@/components/Card/Card'
import type { TransactionRow } from './useTransactions'

interface Props {
  transaction: TransactionRow
}

export default function ReceiptCard({ transaction }: Props) {
  const totalItems = transaction.transaction_items.reduce((sum, item) => sum + item.quantity, 0)
  const displayTotal = transaction.transaction_items.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <Card style={{ boxShadow: 'var(--shadow-card)', background: 'var(--color-card)' }}>
      <div style={{ fontWeight: 600 }}>{transaction.trx_number}</div>
      <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 12 }}>
        {new Date(transaction.created_at).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </div>

      {transaction.transaction_items.map((item) => (
  <div
    key={item.id}
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      gap: 10,
      fontSize: 14,
      marginBottom: 6,
      alignItems: 'baseline',
    }}
  >
    <span>{item.products.name}</span>
    <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
      {item.quantity} x Rp{item.price_at_sale.toLocaleString('id-ID')}
    </span>
    <span style={{ fontWeight: 600, textAlign: 'right' }}>Rp{item.subtotal.toLocaleString('id-ID')}</span>
  </div>
))}

      <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 12, paddingTop: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{totalItems} Item</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginTop: 4 }}>
          <span>Total</span>
          <span>Rp{displayTotal.toLocaleString('id-ID')}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: 4 }}>
  {transaction.payment_method === 'cash' ? 'Tunai' : transaction.payment_method}
</div>

{transaction.notes && (
  <div
    style={{
      marginTop: 10,
      paddingTop: 10,
      borderTop: '1px dashed var(--color-border)',
      fontSize: 13,
      color: 'var(--color-text-muted)',
      fontStyle: 'italic',
    }}
  >
    "{transaction.notes}"
  </div>
)}
      </div>
    </Card>
  )
}