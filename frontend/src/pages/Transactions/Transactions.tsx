import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import NewTransactionForm from '@/features/transactions/NewTransactionForm'
import { useTransactions } from '@/features/transactions/useTransactions'
import AllTransactionsTable from '@/features/transactions/AllTransactionsTable'
import ReceiptCard from '@/features/transactions/ReceiptCard'
import Card from '@/components/Card/Card'
import PageTopBar from '@/components/PageTopBar/PageTopBar'

type ViewMode = 'all' | 'receipts'
type TimeFilter = 'all' | 'today' | 'month' | 'year' | 'custom'

const timeOptions: { label: string; value: TimeFilter }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Hari Ini', value: 'today' },
  { label: 'Bulan Ini', value: 'month' },
  { label: 'Tahun Ini', value: 'year' },
  { label: 'Kustom', value: 'custom' },
]

const dateInputStyle = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontSize: 13,
}

export default function Transactions() {
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<ViewMode>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [appliedFrom, setAppliedFrom] = useState('')
  const [appliedTo, setAppliedTo] = useState('')
  const { transactions, loading, refetch } = useTransactions()

  const timeFilteredTransactions = useMemo(() => {
    if (timeFilter === 'all') return transactions

    const now = new Date()
    let start: Date | null = null
    let end: Date | null = null

    if (timeFilter === 'today') {
      start = new Date()
      start.setHours(0, 0, 0, 0)
      end = new Date()
      end.setHours(23, 59, 59, 999)
    } else if (timeFilter === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    } else if (timeFilter === 'year') {
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
    } else if (timeFilter === 'custom') {
      if (!appliedFrom || !appliedTo) return transactions
      start = new Date(appliedFrom)
      start.setHours(0, 0, 0, 0)
      end = new Date(appliedTo)
      end.setHours(23, 59, 59, 999)
    }

    if (!start || !end) return transactions
    return transactions.filter((trx) => {
      const d = new Date(trx.created_at)
      return d >= start! && d <= end!
    })
  }, [transactions, timeFilter, appliedFrom, appliedTo])

  function handleApplyCustom() {
    setAppliedFrom(customFrom)
    setAppliedTo(customTo)
  }

  return (
    <div>
      <PageTopBar
        title="Transaksi"
        action={
          !showForm && (
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
          )
        }
      />

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

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                padding: 4,
                borderRadius: 20,
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
              }}
            >
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTimeFilter(opt.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 16,
                    border: 'none',
                    fontSize: 13,
                    cursor: 'pointer',
                    background: timeFilter === opt.value ? 'var(--color-primary)' : 'transparent',
                    color: timeFilter === opt.value ? '#fff' : 'var(--color-text)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {timeFilter === 'custom' && (
              <>
                <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={dateInputStyle} />
                <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>sampai</span>
                <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={dateInputStyle} />
                <button
                  onClick={handleApplyCustom}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Terapkan
                </button>
              </>
            )}
          </div>

          {loading ? (
            <p>Memuat...</p>
          ) : view === 'all' ? (
            <AllTransactionsTable transactions={timeFilteredTransactions} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {timeFilteredTransactions.map((trx) => (
                <ReceiptCard key={trx.id} transaction={trx} />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}