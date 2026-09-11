import { useState } from 'react'
import { Plus } from 'lucide-react'
import NewTransactionForm from '@/features/transactions/NewTransactionForm'
import { useTransactions } from '@/features/transactions/useTransactions'
import AllTransactionsTable from '@/features/transactions/AllTransactionsTable'
import ReceiptCard from '@/features/transactions/ReceiptCard'
import Card from '@/components/Card/Card'
import BusinessFilterTabs from '@/components/BusinessFilterTabs/BusinessFilterTabs'

type ViewMode = 'all' | 'receipts'

export default function Transactions() {
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<ViewMode>('all')
  const { transactions, loading, refetch } = useTransactions()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: 'var(--color-text)' }}>Transaksi</h1>
        {!showForm && (
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
            <Plus size={16} /> Transaksi Baru
          </button>
        )}
      </div>

      {!showForm && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <BusinessFilterTabs />
        </div>
      )}

      {showForm ? (
        <Card style={{ boxShadow: 'var(--shadow-card)', minHeight: '70vh' }}>
          <NewTransactionForm
            onSuccess={() => {
              setShowForm(false)
              refetch()
            }}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      ) : (
        <Card style={{ boxShadow: 'var(--shadow-card)', minHeight: '70vh' }}>
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
              Semua Transaksi
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
              Struk
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
        </Card>
      )}
    </div>
  )
}