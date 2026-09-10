import { useEffect, useState } from 'react'
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

export default function NewTransactionForm({ onSuccess, onCancel }: NewTransactionFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer'>('cash')
  const [saving, setSaving] = useState(false)

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

    // 1. Create the transaction header
    const { data: trx, error: trxError } = await supabase
      .from('transactions')
      .insert({ trx_number: trxNumber, payment_method: paymentMethod, total })
      .select()
      .single()

    if (trxError || !trx) {
      setSaving(false)
      return
    }

    // 2. Insert all transaction items
    const items = cart.map((item) => ({
      transaction_id: trx.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_sale: item.product.selling_price,
      subtotal: item.product.selling_price * item.quantity,
    }))

    await supabase.from('transaction_items').insert(items)

    // 3. Reduce stock and log stock movement for each item
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
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 1 }}>
        <input
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginBottom: 12 }}
        />
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 8,
                borderBottom: '1px solid #f5f5f5',
              }}
            >
              <span>{p.name} — Rp{p.selling_price.toLocaleString('id-ID')}</span>
              <button onClick={() => addToCart(p)} style={{ padding: '4px 10px', borderRadius: 6 }}>
                +
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h3>Current Transaction</h3>
        {cart.length === 0 && <p style={{ color: '#999' }}>No items yet</p>}
        {cart.map((item) => (
          <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>{item.product.name}</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
              <span>Rp{(item.product.selling_price * item.quantity).toLocaleString('id-ID')}</span>
            </div>
          </div>
        ))}

        <hr />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, margin: '12px 0' }}>
          <span>TOTAL</span>
          <span>Rp{total.toLocaleString('id-ID')}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {(['cash', 'qris', 'transfer'] as const).map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #ccc',
                background: paymentMethod === method ? '#95B1EE' : 'transparent',
                textTransform: 'capitalize',
              }}
            >
              {method}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ padding: 10, borderRadius: 8 }}>Cancel</button>
          <button
            onClick={handleCompleteSale}
            disabled={saving || cart.length === 0}
            style={{ flex: 1, padding: 10, borderRadius: 8, background: '#95B1EE', border: 'none' }}
          >
            {saving ? 'Saving...' : 'Complete Sale'}
          </button>
        </div>
      </div>
    </div>
  )
}