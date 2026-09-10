import type { TransactionRow } from './useTransactions'

interface Props {
  transactions: TransactionRow[]
}

export default function AllTransactionsTable({ transactions }: Props) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
          <th style={{ padding: 8 }}>Date</th>
          <th style={{ padding: 8 }}>Receipt</th>
          <th style={{ padding: 8 }}>Product</th>
          <th style={{ padding: 8 }}>Category</th>
          <th style={{ padding: 8 }}>Qty</th>
          <th style={{ padding: 8 }}>Price</th>
          <th style={{ padding: 8 }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((trx) =>
          trx.transaction_items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: 8 }}>{new Date(trx.created_at).toLocaleDateString('id-ID')}</td>
              <td style={{ padding: 8 }}>{trx.trx_number}</td>
              <td style={{ padding: 8 }}>{item.products.name}</td>
              <td style={{ padding: 8, textTransform: 'capitalize' }}>{item.products.category}</td>
              <td style={{ padding: 8 }}>{item.quantity}</td>
              <td style={{ padding: 8 }}>Rp{item.price_at_sale.toLocaleString('id-ID')}</td>
              <td style={{ padding: 8 }}>Rp{item.subtotal.toLocaleString('id-ID')}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}