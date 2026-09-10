import type { TransactionRow } from './useTransactions'

interface Props {
  transactions: TransactionRow[]
}

function CategoryBadge({ category }: { category: string }) {
  const isPlastik = category === 'plastik'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'capitalize',
        background: isPlastik ? 'var(--color-accent)' : 'rgba(149, 177, 238, 0.25)',
        color: isPlastik ? 'var(--color-text)' : 'var(--color-primary)',
      }}
    >
      {category}
    </span>
  )
}

export default function AllTransactionsTable({ transactions }: Props) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
          <th style={{ padding: '10px 14px', fontSize: 12, letterSpacing: 0.5, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Date</th>
          <th style={{ padding: '10px 14px', fontSize: 12, letterSpacing: 0.5, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Receipt</th>
          <th style={{ padding: '10px 14px', fontSize: 12, letterSpacing: 0.5, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Product</th>
          <th style={{ padding: '10px 14px', fontSize: 12, letterSpacing: 0.5, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Category</th>
          <th style={{ padding: '10px 14px', fontSize: 12, letterSpacing: 0.5, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Qty</th>
          <th style={{ padding: '10px 14px', fontSize: 12, letterSpacing: 0.5, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Price</th>
          <th style={{ padding: '10px 14px', fontSize: 12, letterSpacing: 0.5, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((trx) =>
          trx.transaction_items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: 14 }}>{new Date(trx.created_at).toLocaleDateString('id-ID')}</td>
              <td style={{ padding: 14, color: 'var(--color-primary)' }}>{trx.trx_number}</td>
              <td style={{ padding: 14, fontWeight: 600 }}>{item.products.name}</td>
              <td style={{ padding: 14 }}>
                <CategoryBadge category={item.products.category} />
              </td>
              <td style={{ padding: 14 }}>{item.quantity}</td>
              <td style={{ padding: 14 }}>Rp{item.price_at_sale.toLocaleString('id-ID')}</td>
              <td style={{ padding: 14, fontWeight: 700 }}>Rp{item.subtotal.toLocaleString('id-ID')}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}