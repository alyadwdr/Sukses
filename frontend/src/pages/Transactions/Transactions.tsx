import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import NewTransactionForm from '@/features/transactions/NewTransactionForm'
import { useTransactions } from '@/features/transactions/useTransactions'
import AllTransactionsTable from '@/features/transactions/AllTransactionsTable'
import ReceiptCard from '@/features/transactions/ReceiptCard'
import Card from '@/components/Card/Card'
import PageTopBar from '@/components/PageTopBar/PageTopBar'
import Loading from '@/components/Loading/Loading'

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

const searchInputStyle = {
  width: '100%',
  padding: '10px 12px 10px 38px',
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
}

export default function Transactions() {
  const [searchParams] = useSearchParams()
  const highlightTrx = searchParams.get('highlight')

  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<ViewMode>(highlightTrx ? 'receipts' : 'all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [appliedFrom, setAppliedFrom] = useState('')
  const [appliedTo, setAppliedTo] = useState('')
  const [search, setSearch] = useState('')
  const { transactions, loading, refetch } = useTransactions()

  useEffect(() => {
    if (highlightTrx) setView('receipts')
  }, [highlightTrx])

  useEffect(() => {
    if (!highlightTrx || loading) return
    const el = document.getElementById(`receipt-${highlightTrx}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightTrx, loading, transactions])

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

  const searchedTransactions = useMemo(() => {
    if (!search.trim()) return timeFilteredTransactions
    const q = search.toLowerCase()
    return timeFilteredTransactions.filter(
      (trx) =>
        trx.trx_number.toLowerCase().includes(q) ||
        trx.transaction_items.some((item) => item.products.name.toLowerCase().includes(q))
    )
  }, [timeFilteredTransactions, search])

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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
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

            <div style={{ position: 'relative', width: 240 }}>
              <Search
                size={16}
                color="var(--color-text-muted)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                placeholder="Cari no. struk / produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchInputStyle}
              />
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : view === 'all' ? (
            <AllTransactionsTable transactions={searchedTransactions} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {searchedTransactions.map((trx) => (
                <ReceiptCard key={trx.id} transaction={trx} highlighted={trx.trx_number === highlightTrx} />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}