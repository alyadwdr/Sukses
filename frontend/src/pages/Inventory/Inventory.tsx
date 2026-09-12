import { useMemo, useRef, useState } from 'react'
import { Plus, Search, List, Grid2x2, LayoutGrid, ChevronDown } from 'lucide-react'
import { useProducts } from '@/features/products/useProducts'
import { useStockMovements } from '@/features/inventory/useStockMovements'
import StockInForm from '@/features/inventory/StockInForm'
import Card from '@/components/Card/Card'
import PageTopBar from '@/components/PageTopBar/PageTopBar'
import CategoryBadge from '@/components/CategoryBadge/CategoryBadge'
import { useBusinessFilter } from '@/context/BusinessFilterContext'

type ViewMode = 'list' | 'large' | 'medium' | 'small'
type TimeFilter = 'all' | 'today' | 'month' | 'year' | 'custom'

const viewOptions: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
  { value: 'list', label: 'Daftar', icon: <List size={15} /> },
  { value: 'large', label: 'Ikon Besar', icon: <Grid2x2 size={15} /> },
  { value: 'medium', label: 'Ikon Sedang', icon: <LayoutGrid size={15} /> },
  { value: 'small', label: 'Ikon Kecil', icon: <LayoutGrid size={13} /> },
]

const timeOptions: { label: string; value: TimeFilter }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Hari Ini', value: 'today' },
  { label: 'Bulan Ini', value: 'month' },
  { label: 'Tahun Ini', value: 'year' },
  { label: 'Kustom', value: 'custom' },
]

const sizeConfig: Record<Exclude<ViewMode, 'list'>, { minWidth: number; avatar: number; font: number }> = {
  large: { minWidth: 200, avatar: 80, font: 14 },
  medium: { minWidth: 150, avatar: 58, font: 13 },
  small: { minWidth: 100, avatar: 36, font: 11 },
}

const thStyle = {
  padding: '10px 14px',
  fontSize: 12,
  letterSpacing: 0.5,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase' as const,
}

const searchInputStyle = {
  width: '100%',
  padding: '10px 12px 10px 38px',
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
}

const dateInputStyle = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontSize: 12,
}

function ViewSwitcher({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          height: '100%',
          padding: '0 12px',
          borderRadius: 10,
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
        }}
      >
        <LayoutGrid size={16} />
        <ChevronDown size={14} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            boxShadow: 'var(--shadow-card)',
            padding: 6,
            zIndex: 10,
            width: 170,
          }}
        >
          {viewOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: 'none',
                background: value === opt.value ? 'var(--color-bg)' : 'transparent',
                color: 'var(--color-text)',
                cursor: 'pointer',
                fontSize: 13,
                textAlign: 'left',
              }}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DotIndicator({ activeSlide, onSelect }: { activeSlide: number; onSelect: (i: number) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
      {[0, 1].map((i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={i === 0 ? 'Stok Saat Ini' : 'Riwayat Stok'}
          style={{
            width: activeSlide === i ? 28 : 8,
            height: 8,
            borderRadius: 4,
            border: 'none',
            background: activeSlide === i ? 'var(--color-primary)' : 'var(--color-border)',
            cursor: 'pointer',
            transition: 'width 0.2s ease, background 0.2s ease',
          }}
        />
      ))}
    </div>
  )
}

function relativeUpdateLabel(dateStr: string | undefined) {
  if (!dateStr) return 'Belum ada riwayat'
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'Hari ini'
  if (diffDays === 1) return '1 hari lalu'
  if (diffDays < 30) return `${diffDays} hari lalu`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths} bulan lalu`
  return new Date(dateStr).toLocaleDateString('id-ID')
}

export default function Inventory() {
  const { products, refetch: refetchProducts } = useProducts()
  const { movements, loading, refetch: refetchMovements } = useStockMovements()
  const { filter } = useBusinessFilter()

  const [showForm, setShowForm] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [stockSearch, setStockSearch] = useState('')
  const [historySearch, setHistorySearch] = useState('')
  const [stockView, setStockView] = useState<ViewMode>('list')
  const [historyView, setHistoryView] = useState<ViewMode>('list')
  const [historyTimeFilter, setHistoryTimeFilter] = useState<TimeFilter>('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [appliedFrom, setAppliedFrom] = useState('')
  const [appliedTo, setAppliedTo] = useState('')

  const touchStartX = useRef<number | null>(null)
  const lastWheelTime = useRef(0)

  function handleStockInSuccess() {
    setShowForm(false)
    refetchProducts()
    refetchMovements()
  }

  function handlePointerDown(e: React.PointerEvent) {
    touchStartX.current = e.clientX
  }
  function handlePointerUp(e: React.PointerEvent) {
    if (touchStartX.current === null) return
    const diff = e.clientX - touchStartX.current
    if (diff > 60) setActiveSlide(0)
    else if (diff < -60) setActiveSlide(1)
    touchStartX.current = null
  }
  function handleWheel(e: React.WheelEvent) {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return
    const now = Date.now()
    if (now - lastWheelTime.current < 600) return
    if (e.deltaX > 30) {
      setActiveSlide(1)
      lastWheelTime.current = now
    } else if (e.deltaX < -30) {
      setActiveSlide(0)
      lastWheelTime.current = now
    }
  }

  // Peta produk -> tanggal update stok paling baru (dari daftar movements yang sudah urut terbaru dulu)
  const lastUpdateMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const m of movements) {
      const key = (m as any).product_id ?? m.products.name
      if (!map[key]) map[key] = m.created_at
    }
    return map
  }, [movements])

  const productsByBusiness = useMemo(
    () => products.filter((p) => filter === 'all' || p.category === filter),
    [products, filter]
  )
  const filteredProducts = productsByBusiness.filter((p) =>
    p.name.toLowerCase().includes(stockSearch.toLowerCase())
  )

  const movementsByBusiness = useMemo(
    () => movements.filter((m) => filter === 'all' || m.products.category === filter),
    [movements, filter]
  )

  const movementsByTime = useMemo(() => {
    if (historyTimeFilter === 'all') return movementsByBusiness
    const now = new Date()
    let start: Date | null = null
    let end: Date | null = null
    if (historyTimeFilter === 'today') {
      start = new Date(); start.setHours(0, 0, 0, 0)
      end = new Date(); end.setHours(23, 59, 59, 999)
    } else if (historyTimeFilter === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    } else if (historyTimeFilter === 'year') {
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
    } else if (historyTimeFilter === 'custom') {
      if (!appliedFrom || !appliedTo) return movementsByBusiness
      start = new Date(appliedFrom); start.setHours(0, 0, 0, 0)
      end = new Date(appliedTo); end.setHours(23, 59, 59, 999)
    }
    if (!start || !end) return movementsByBusiness
    return movementsByBusiness.filter((m) => {
      const d = new Date(m.created_at)
      return d >= start! && d <= end!
    })
  }, [movementsByBusiness, historyTimeFilter, appliedFrom, appliedTo])

  const filteredMovements = movementsByTime.filter((m) =>
    m.products.name.toLowerCase().includes(historySearch.toLowerCase())
  )

  return (
    <div>
      <PageTopBar
        title="Inventori"
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
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
            <Plus size={16} /> Tambah Stok
          </button>
        }
      />

      <div
        style={{
          maxHeight: showForm ? 200 : 0,
          opacity: showForm ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, opacity 0.25s ease, margin-bottom 0.3s ease',
          marginBottom: showForm ? 24 : 0,
        }}
      >
        <Card style={{ boxShadow: 'var(--shadow-card)' }}>
          <StockInForm products={products} onSuccess={handleStockInSuccess} />
        </Card>
      </div>

      <div style={{ marginBottom: 16 }}>
        <DotIndicator activeSlide={activeSlide} onSelect={setActiveSlide} />
      </div>

      <div onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onWheel={handleWheel} style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            width: '200%',
            transform: `translateX(-${activeSlide * 50}%)`,
            transition: 'transform 0.3s ease',
          }}
        >
          <div style={{ width: '50%', paddingRight: 10, boxSizing: 'border-box' }}>
            <Card style={{ boxShadow: 'var(--shadow-card)', minHeight: 420 }}>
              <h3 style={{ marginBottom: 16 }}>Stok Saat Ini</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input placeholder="Cari stok..." value={stockSearch} onChange={(e) => setStockSearch(e.target.value)} style={searchInputStyle} />
                </div>
                <ViewSwitcher value={stockView} onChange={setStockView} />
              </div>

              {stockView === 'list' ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={thStyle}>Produk</th>
                      <th style={thStyle}>Kategori</th>
                      <th style={thStyle}>Stok Saat Ini</th>
                      <th style={thStyle}>Satuan</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Update Terakhir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: 14, fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: 14 }}>
                          <CategoryBadge category={p.category} />
                        </td>
                        <td style={{ padding: 14 }}>{p.stock}</td>
                        <td style={{ padding: 14 }}>{p.unit}</td>
                        <td style={{ padding: 14 }}>
                          <span
                            style={{
                              padding: '2px 10px',
                              borderRadius: 12,
                              fontSize: 12,
                              background: p.stock <= p.min_stock ? '#fde2e2' : '#e2f5e2',
                              color: p.stock <= p.min_stock ? '#c0392b' : '#27ae60',
                            }}
                          >
                            {p.stock <= p.min_stock ? 'Menipis' : 'Aman'}
                          </span>
                        </td>
                        <td style={{ padding: 14, color: 'var(--color-text-muted)', fontSize: 13 }}>
                          {relativeUpdateLabel(lastUpdateMap[p.id])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${sizeConfig[stockView].minWidth}px, 1fr))`, gap: 12 }}>
                  {filteredProducts.map((p) => (
                    <div key={p.id} style={{ padding: 10, borderRadius: 12, border: '1px solid var(--color-border)', textAlign: 'center' }}>
                      <div
                        style={{
                          width: sizeConfig[stockView].avatar,
                          height: sizeConfig[stockView].avatar,
                          borderRadius: 12,
                          background: p.stock <= p.min_stock ? '#c0392b' : 'var(--color-primary)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px',
                          fontWeight: 700,
                          fontSize: sizeConfig[stockView].avatar / 2.5,
                          overflow: 'hidden',
                        }}
                      >
                        {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontSize: sizeConfig[stockView].font, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: sizeConfig[stockView].font - 1, color: 'var(--color-text-muted)' }}>
                        {p.stock} {p.unit}
                      </div>
                      <div style={{ fontSize: sizeConfig[stockView].font - 2, color: 'var(--color-text-muted)' }}>
                        {relativeUpdateLabel(lastUpdateMap[p.id])}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div style={{ width: '50%', paddingLeft: 10, boxSizing: 'border-box' }}>
            <Card style={{ boxShadow: 'var(--shadow-card)', minHeight: 420 }}>
              <h3 style={{ marginBottom: 16 }}>Riwayat Stok</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input placeholder="Cari riwayat..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} style={searchInputStyle} />
                </div>
                <ViewSwitcher value={historyView} onChange={setHistoryView} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', padding: 3, borderRadius: 16, background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  {timeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setHistoryTimeFilter(opt.value)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 13,
                        border: 'none',
                        fontSize: 12,
                        cursor: 'pointer',
                        background: historyTimeFilter === opt.value ? 'var(--color-primary)' : 'transparent',
                        color: historyTimeFilter === opt.value ? '#fff' : 'var(--color-text)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {historyTimeFilter === 'custom' && (
                  <>
                    <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={dateInputStyle} />
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>-</span>
                    <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={dateInputStyle} />
                    <button
                      onClick={() => { setAppliedFrom(customFrom); setAppliedTo(customTo) }}
                      style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 12, cursor: 'pointer' }}
                    >
                      Terapkan
                    </button>
                  </>
                )}
              </div>

              {loading ? (
                <p>Memuat...</p>
              ) : historyView === 'list' ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={thStyle}>Tanggal</th>
                      <th style={thStyle}>Produk</th>
                      <th style={thStyle}>Kategori</th>
                      <th style={thStyle}>Perubahan</th>
                      <th style={thStyle}>Alasan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovements.map((m) => (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: 14 }}>{new Date(m.created_at).toLocaleDateString('id-ID')}</td>
                        <td style={{ padding: 14, fontWeight: 600 }}>{m.products.name}</td>
                        <td style={{ padding: 14 }}>
                          <CategoryBadge category={m.products.category} />
                        </td>
                        <td style={{ padding: 14, color: m.change > 0 ? '#27ae60' : '#c0392b' }}>
                          {m.change > 0 ? '+' : ''}
                          {m.change} {m.products.unit}
                        </td>
                        <td style={{ padding: 14, textTransform: 'capitalize' }}>
                          {m.reason === 'stock_in' ? 'Stok Masuk' : m.reason === 'sale' ? 'Penjualan' : 'Penyesuaian'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${sizeConfig[historyView].minWidth}px, 1fr))`, gap: 12 }}>
                  {filteredMovements.map((m) => (
                    <div key={m.id} style={{ padding: 10, borderRadius: 12, border: '1px solid var(--color-border)', textAlign: 'center' }}>
                      <div
                        style={{
                          width: sizeConfig[historyView].avatar,
                          height: sizeConfig[historyView].avatar,
                          borderRadius: 12,
                          background: m.change > 0 ? '#27ae60' : '#c0392b',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px',
                          fontWeight: 700,
                          fontSize: sizeConfig[historyView].avatar / 2.5,
                        }}
                      >
                        {m.products.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontSize: sizeConfig[historyView].font, fontWeight: 600 }}>{m.products.name}</div>
                      <div style={{ fontSize: sizeConfig[historyView].font - 1, color: m.change > 0 ? '#27ae60' : '#c0392b' }}>
                        {m.change > 0 ? '+' : ''}
                        {m.change} {m.products.unit}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <DotIndicator activeSlide={activeSlide} onSelect={setActiveSlide} />
      </div>
    </div>
  )
}