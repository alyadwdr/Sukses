import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import BusinessFilterTabs from '@/components/BusinessFilterTabs/BusinessFilterTabs'
import NewTransactionForm from '@/features/transactions/NewTransactionForm'
import { useTransactions } from '@/features/transactions/useTransactions'
import AllTransactionsTable from '@/features/transactions/AllTransactionsTable'
import ReceiptCard from '@/features/transactions/ReceiptCard'
import Card from '@/components/Card/Card'
import PageTopBar from '@/components/PageTopBar/PageTopBar'
import Loading from '@/components/Loading/Loading'
import TimeFilterTabs, { type TimeFilterValue } from '@/components/TimeFilterTabs/TimeFilterTabs'
import { jakartaRangeFor } from '@/lib/time'

type ViewMode = 'all' | 'receipts'

const searchInputStyle = {
  width: '100%',
  padding: '10px 12px 10px 38px',
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-muted)',
  color: 'var(--color-text)',
}

export default function Transactions() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [searchParams] = useSearchParams()
  const highlightTrx = searchParams.get('highlight')

  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<ViewMode>(highlightTrx ? 'receipts' : 'all')
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>('all')
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
    const { start, end } = jakartaRangeFor(timeFilter, appliedFrom, appliedTo)
    if (!start || !end) return transactions

    return transactions.filter((trx) => {
      const d = new Date(trx.created_at)
      return d >= start && d <= end
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

  if (isMobile) {
    const now = new Date()
    const monthTransactions = transactions.filter((trx) => {
      const d = new Date(trx.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const monthTotal = monthTransactions.reduce((sum, trx) => sum + trx.total, 0)

    return (
      <div>
        <PageTopBar title="Transaksi" onMobileAdd={() => navigate('/dashboard/transactions/new')} />

        <div style={{ marginBottom: 16 }}>
          <BusinessFilterTabs />
        </div>

        <div
          style={{
            background: 'var(--color-inverse-surface)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--color-on-inverse-muted)', marginBottom: 6 }}>Total Transaksi Bulan Ini</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-on-inverse)' }}>Rp{monthTotal.toLocaleString('id-ID')}</span>
            <span style={{ fontSize: 13, color: 'var(--color-accent-on-inverse)', fontWeight: 600 }}>{monthTransactions.length} transaksi</span>
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            placeholder="Cari no. struk / produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...searchInputStyle, background: 'var(--color-card)' }}
          />
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {searchedTransactions.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Belum ada transaksi</p>}
            {searchedTransactions.map((trx) => (
              <div
                key={trx.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 14,
                  borderRadius: 14,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-card)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{trx.trx_number}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {new Date(trx.created_at).toLocaleDateString('id-ID')} · {trx.transaction_items.length} item ·{' '}
                    {trx.payment_method === 'cash' ? 'Tunai' : trx.payment_method.toUpperCase()}
                  </div>
                </div>
                <span style={{ fontWeight: 700 }}>Rp{trx.total.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
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
                background: 'var(--color-primary-solid)',
                color: 'var(--color-on-primary)',
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
          <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--color-divider)', marginBottom: 20 }}>
            <button
              onClick={() => setView('all')}
              style={{
                padding: '10px 4px',
                background: 'transparent',
                border: 'none',
                borderBottom: view === 'all' ? '2px solid var(--color-primary-text)' : '2px solid transparent',
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
                borderBottom: view === 'receipts' ? '2px solid var(--color-primary-text)' : '2px solid transparent',
                color: view === 'receipts' ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: view === 'receipts' ? 600 : 400,
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              Struk
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
            <TimeFilterTabs
              value={timeFilter}
              onChange={setTimeFilter}
              customFrom={customFrom}
              customTo={customTo}
              onCustomFromChange={setCustomFrom}
              onCustomToChange={setCustomTo}
              onApplyCustom={handleApplyCustom}
            />

            <div style={{ position: 'relative', width: 300, flexShrink: 0 }}>
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