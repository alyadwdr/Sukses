import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Calendar, Banknote, QrCode, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useNotifications } from '@/context/NotificationsContext'
import { jakartaDateString, jakartaTimestampOnDate } from '@/lib/time'
import type { Product } from '@/types/product'

interface CartItem {
  product: Product
  quantity: number
}

function todayStr() {
  return jakartaDateString()
}

const inputStyle = {
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid var(--color-border)',
  background: 'var(--color-card)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
}

export default function NewTransactionPage() {
  const navigate = useNavigate()
  const { refetch: refetchNotifications } = useNotifications()

  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [lastTouchedId, setLastTouchedId] = useState<string | null>(null)
  const [cartExpanded, setCartExpanded] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash')
  const [transactionDate, setTransactionDate] = useState(todayStr())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .then(({ data }) => {
        if (data) setProducts(data)
      })
  }, [])

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  function addToCart(product: Product) {
    if (product.stock <= 0) return
    setLastTouchedId(product.id)
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function updateQuantity(productId: string, quantity: number) {
    setLastTouchedId(productId)
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId))
      return
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item
        const clamped = Math.min(quantity, item.product.stock)
        return { ...item, quantity: clamped }
      })
    )
  }

  const total = cart.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0)
  const lastItem = cart.find((item) => item.product.id === lastTouchedId) ?? cart[cart.length - 1]

  async function handleCompleteSale() {
    if (cart.length === 0) return
    setSaving(true)
    setSaveError('')

    const createdAt = jakartaTimestampOnDate(transactionDate)

    const items = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_sale: item.product.selling_price,
      subtotal: item.product.selling_price * item.quantity,
    }))

    const { error } = await supabase.rpc('create_sale', {
      p_payment_method: paymentMethod,
      p_total: total,
      p_notes: null,
      p_cash_received: null,
      p_created_at: createdAt.toISOString(),
      p_items: items,
    })

    setSaving(false)

    if (error) {
      console.error('Gagal menyimpan transaksi:', error)
      setSaveError(error.message || 'Transaksi gagal disimpan. Coba lagi.')
      return
    }

    refetchNotifications()
    navigate('/dashboard/transactions')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid var(--color-border)',
            background: 'var(--color-card)',
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ color: 'var(--color-text)', fontSize: 20 }}>Transaksi Baru</h1>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            background: 'var(--color-card)',
          }}
        >
          <Calendar size={16} color="var(--color-text-muted)" />
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)', flexShrink: 0 }}>Tanggal Transaksi</span>
          <input
            type="date"
            value={transactionDate}
            max={todayStr()}
            onChange={(e) => setTransactionDate(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontWeight: 600, textAlign: 'right' }}
          />
        </div>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, width: '100%', paddingLeft: 40 }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', paddingBottom: cart.length === 0 ? 16 : 8 }}>
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => addToCart(p)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 4px',
              borderBottom: '1px solid var(--color-divider)',
              cursor: p.stock <= 0 ? 'not-allowed' : 'pointer',
              opacity: p.stock <= 0 ? 0.5 : 1,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Rp{p.selling_price.toLocaleString('id-ID')} · Stok {p.stock}
              </div>
            </div>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: p.stock <= 0 ? 'var(--color-border)' : 'var(--color-primary-solid)',
                color: 'var(--color-on-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              +
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          background: 'var(--color-accent)',
          borderTop: '1px solid var(--color-accent-border)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '18px 16px',
          paddingBottom: 'calc(18px + env(safe-area-inset-bottom))',
        }}
      >
        {cart.length === 0 ? (
          <p style={{ color: 'var(--color-on-accent-muted)', fontSize: 13, textAlign: 'center', margin: 0 }}>Belum ada item</p>
        ) : (
          <>
            <button
              onClick={() => setCartExpanded((v) => !v)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                padding: 0,
                marginBottom: cartExpanded ? 14 : 10,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {!cartExpanded && lastItem ? (
                <>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-on-accent)' }}>{lastItem.product.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-on-accent-muted)' }}>
                      {lastItem.quantity} × Rp{lastItem.product.selling_price.toLocaleString('id-ID')} · {cart.length} produk
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-on-accent)' }}>
                      Rp{(lastItem.product.selling_price * lastItem.quantity).toLocaleString('id-ID')}
                    </span>
                    <ChevronUp size={16} color="var(--color-on-accent)" />
                  </div>
                </>
              ) : (
                <>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-on-accent)' }}>Rincian Transaksi</span>
                  <ChevronDown size={16} color="var(--color-on-accent)" />
                </>
              )}
            </button>

            {cartExpanded && (
              <div style={{ maxHeight: '40vh', overflowY: 'auto', marginBottom: 12 }}>
                {cart.map((item) => (
                  <div key={item.product.id} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, marginBottom: 4, color: 'var(--color-on-accent)' }}>{item.product.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--color-accent-border)', background: 'var(--color-accent-control)', color: 'var(--color-accent-control-text)', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: 13, color: 'var(--color-on-accent)' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            border: '1px solid var(--color-accent-border)',
                            background: 'var(--color-accent-control)',
                            color: 'var(--color-accent-control-text)',
                            opacity: item.quantity >= item.product.stock ? 0.4 : 1,
                            cursor: item.quantity >= item.product.stock ? 'not-allowed' : 'pointer',
                          }}
                        >
                          +
                        </button>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-on-accent)' }}>
                        Rp{(item.product.selling_price * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginBottom: 14, color: 'var(--color-on-accent)' }}>
              <span>TOTAL</span>
              <span>Rp{total.toLocaleString('id-ID')}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button
                onClick={() => setPaymentMethod('cash')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 0',
                  borderRadius: 10,
                  border: '1px solid var(--color-accent-border)',
                  background: paymentMethod === 'cash' ? 'var(--color-primary-solid)' : 'var(--color-accent-control)',
                  color: paymentMethod === 'cash' ? 'var(--color-on-primary)' : 'var(--color-accent-control-text)',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                <Banknote size={15} /> Tunai
              </button>
              <button
                onClick={() => setPaymentMethod('qris')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 0',
                  borderRadius: 10,
                  border: '1px solid var(--color-accent-border)',
                  background: paymentMethod === 'qris' ? 'var(--color-primary-solid)' : 'var(--color-accent-control)',
                  color: paymentMethod === 'qris' ? 'var(--color-on-primary)' : 'var(--color-accent-control-text)',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                <QrCode size={15} /> QRIS
              </button>
            </div>

            {saveError && (
              <div style={{ fontSize: 12, color: 'var(--color-danger-text)', marginBottom: 10, fontWeight: 600 }}>{saveError}</div>
            )}

            <button
              onClick={handleCompleteSale}
              disabled={saving}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 12,
                background: 'var(--color-primary-solid)',
                color: 'var(--color-on-primary)',
                border: 'none',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Menyimpan...' : 'Simpan Transaksi Baru'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}