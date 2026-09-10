import { useEffect, useState } from 'react'
import { Search, X, List, Grid2x2, LayoutGrid, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/product'

interface CartItem {
  product: Product
  quantity: number
}

interface NewTransactionFormProps {
  onSuccess: () => void
  onCancel: () => void
}

type ViewMode = 'list' | 'large' | 'medium' | 'small'

const viewOptions: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
  { value: 'list', label: 'List', icon: <List size={15} /> },
  { value: 'large', label: 'Large icons', icon: <Grid2x2 size={15} /> },
  { value: 'medium', label: 'Medium icons', icon: <LayoutGrid size={15} /> },
  { value: 'small', label: 'Small icons', icon: <LayoutGrid size={13} /> },
]

const sizeConfig: Record<Exclude<ViewMode, 'list'>, { minWidth: number; avatar: number; font: number }> = {
  large: { minWidth: 200, avatar: 90, font: 14 },
  medium: { minWidth: 150, avatar: 64, font: 13 },
  small: { minWidth: 100, avatar: 40, font: 11 },
}

export default function NewTransactionForm({ onSuccess, onCancel }: NewTransactionFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer'>('cash')
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [viewMenuOpen, setViewMenuOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .then(({ data }) => {
        if (data) setProducts(data)
      })
  }, [])

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId))
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    )
  }

  const total = cart.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0)

  async function handleCompleteSale() {
    if (cart.length === 0) return
    setSaving(true)

    const trxNumber = `TRX-${Date.now()}`

    const { data: trx, error: trxError } = await supabase
      .from('transactions')
      .insert({ trx_number: trxNumber, payment_method: paymentMethod, total })
      .select()
      .single()

    if (trxError || !trx) {
      setSaving(false)
      return
    }

    const items = cart.map((item) => ({
      transaction_id: trx.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_sale: item.product.selling_price,
      subtotal: item.product.selling_price * item.quantity,
    }))

    await supabase.from('transaction_items').insert(items)

    for (const item of cart) {
      await supabase
        .from('products')
        .update({ stock: item.product.stock - item.quantity })
        .eq('id', item.product.id)

      await supabase.from('stock_movements').insert({
        product_id: item.product.id,
        change: -item.quantity,
        reason: 'sale',
      })
    }

    setSaving(false)
    onSuccess()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: 'var(--color-text)' }}>New Transaction</h2>
        <button
          onClick={onCancel}
          aria-label="Close"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid var(--color-border)',
            background: 'var(--color-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} color="var(--color-text)" />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={16}
                color="var(--color-text-muted)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setViewMenuOpen((v) => !v)}
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

              {viewMenuOpen && (
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
                        setViewMode(opt.value)
                        setViewMenuOpen(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 6,
                        border: 'none',
                        background: viewMode === opt.value ? 'var(--color-bg)' : 'transparent',
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
          </div>

          {viewMode === 'list' ? (
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 8px',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                      Rp{p.selling_price.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: 'var(--color-primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, minmax(${sizeConfig[viewMode].minWidth}px, 1fr))`,
                gap: 12,
                maxHeight: 340,
                overflowY: 'auto',
              }}
            >
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  style={{
                    cursor: 'pointer',
                    padding: 10,
                    borderRadius: 12,
                    border: '1px solid var(--color-border)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: sizeConfig[viewMode].avatar,
                      height: sizeConfig[viewMode].avatar,
                      borderRadius: 12,
                      background: 'var(--color-primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      fontWeight: 700,
                      fontSize: sizeConfig[viewMode].avatar / 2.5,
                      overflow: 'hidden',
                    }}
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      p.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={{ fontSize: sizeConfig[viewMode].font, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: sizeConfig[viewMode].font - 1, color: 'var(--color-text-muted)' }}>
                    Rp{p.selling_price.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            background: 'var(--color-bg)',
            borderRadius: 16,
            padding: 20,
          }}
        >
          <h3 style={{ marginBottom: 16 }}>Current Transaction</h3>
          {cart.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No items yet</p>}
          {cart.map((item) => (
            <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
              <span>{item.product.name}</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}
                >
                  +
                </button>
                <span style={{ minWidth: 80, textAlign: 'right', fontWeight: 600 }}>
                  Rp{(item.product.selling_price * item.quantity).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          ))}

          <hr style={{ borderColor: 'var(--color-border)', margin: '16px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
            <span>TOTAL</span>
            <span>Rp{total.toLocaleString('id-ID')}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['cash', 'qris', 'transfer'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  background: paymentMethod === method ? 'var(--color-primary)' : 'var(--color-card)',
                  color: paymentMethod === method ? '#fff' : 'var(--color-text)',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                }}
              >
                {method}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onCancel}
              style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-text)', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteSale}
              disabled={saving || cart.length === 0}
              style={{ flex: 2, padding: 12, borderRadius: 10, background: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              {saving ? 'Saving...' : 'Complete Sale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}