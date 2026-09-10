import { useState } from 'react'
import { Plus } from 'lucide-react'
import NewTransactionForm from '@/features/transactions/NewTransactionForm'
import { useTransactions } from '@/features/transactions/useTransactions'
import AllTransactionsTable from '@/features/transactions/AllTransactionsTable'
import ReceiptCard from '@/features/transactions/ReceiptCard'
import Card from '@/components/Card/Card'
import { useBusinessFilter } from '@/context/BusinessFilterContext'

type ViewMode = 'all' | 'receipts'

const filterOptions: { label: string; value: 'all' | 'plastik' | 'sembako' }[] = [
  { label: 'Sembako & Plastik', value: 'all' },
  { label: 'Plastik', value: 'plastik' },
  { label: 'Sembako', value: 'sembako' },
]

export default function Transactions() {
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<ViewMode>('all')
  const { transactions, loading, refetch } = useTransactions()
  const { filter, setFilter } = useBusinessFilter()

  return (
    <Card style={{ boxShadow: 'var(--shadow-card)', minHeight: '80vh' }}>
      {showForm ? (
        <NewTransactionForm
          onSuccess={() => {
            setShowForm(false)
            refetch()
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h1 style={{ color: 'var(--color-text)' }}>Transactions</h1>
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                borderRadius: 24,
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={16} /> New Transaction
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div
              style={{
                display: 'inline-flex',
                padding: 4,
                borderRadius: 20,
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
              }}
            >
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 16,
                    border: 'none',
                    cursor: 'pointer',
                    background: filter === opt.value ? 'var(--color-primary)' : 'transparent',
                    color: filter === opt.value ? '#fff' : 'var(--color-text)',
                    fontWeight: filter === opt.value ? 600 : 400,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--color-border)', marginBottom: 20 }}>
            <button
              onClick={() => setView('all')}
              style={{
                padding: '10px 4px',
                background: 'transparent',
                border: 'none',
                borderBottom: view === 'all' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: view === 'all' ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: view === 'all' ? 600 : 400,
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              All Transactions
            </button>
            <button
              onClick={() => setView('receipts')}
              style={{
                padding: '10px 4px',
                background: 'transparent',
                border: 'none',
                borderBottom: view === 'receipts' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: view === 'receipts' ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: view === 'receipts' ? 600 : 400,
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              Receipts
            </button>
          </div>

          {loading ? (
            <p>Memuat...</p>
          ) : view === 'all' ? (
            <AllTransactionsTable transactions={transactions} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {transactions.map((trx) => (
                <ReceiptCard key={trx.id} transaction={trx} />
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  )
}