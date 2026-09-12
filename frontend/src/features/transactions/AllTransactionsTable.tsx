import type { TransactionRow } from './useTransactions'
import CategoryBadge from '@/components/CategoryBadge/CategoryBadge'

interface Props {
  transactions: TransactionRow[]
}

export default function AllTransactionsTable({ transactions }: Props) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
          <th style={{ padding: '10px 14px', fontSize: 12, letterSpacing: 0.5, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Tanggal</th>
          <th style={{ padding: '10px 14px', fontSize: 12, letterSpacing: 0.5, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>No. Struk</th>
          <th style={{ padding: '10px 14px', fontSize: 12, letterSpacing: 0.5, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Produk</th>
          <th style={{ padding: '10px 14px', fontSize: 12, letterSpacing: 0.5, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Kategori</th>
          <th style={{ padding: '10px 14px', fontSize: 12, letterSpacing: 0.5, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Jumlah</th>
          <th style={{ padding: '10px 14px', fontSize: 12, letterSpacing: 0.5, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Harga</th>
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