import { useState } from 'react'
import NewTransactionForm from '@/features/transactions/NewTransactionForm'
import { useTransactions } from '@/features/transactions/useTransactions'
import AllTransactionsTable from '@/features/transactions/AllTransactionsTable'
import ReceiptCard from '@/features/transactions/ReceiptCard'
import PageHeader from '@/components/PageHeader/PageHeader'

type ViewMode = 'all' | 'receipts'

export default function Transactions() {
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<ViewMode>('all')
  const { transactions, loading, refetch } = useTransactions()

  return (
    <div>
      <PageHeader
        title="Transactions"
        action={
          <button onClick={() => setShowForm(true)} style={{ padding: '8px 16px', borderRadius: 8, background: '#95B1EE', border: 'none' }}>
            + New Transaction
          </button>
        }
        showFilter={!showForm}
      />

      {showForm && (
        <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 12, marginBottom: 24 }}>
          <NewTransactionForm
            onSuccess={() => {
              setShowForm(false)
              refetch()
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {!showForm && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setView('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                background: view === 'all' ? 'var(--color-primary)' : 'transparent',
              }}
            >
              All Transactions
            </button>
            <button
              onClick={() => setView('receipts')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                background: view === 'receipts' ? 'var(--color-primary)' : 'transparent',
              }}
            >
              Receipts
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : view === 'all' ? (
            <AllTransactionsTable transactions={transactions} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {transactions.map((trx) => (
                <ReceiptCard key={trx.id} transaction={trx} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}