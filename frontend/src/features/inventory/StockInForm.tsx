import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/product'

interface StockInFormProps {
  products: Product[]
  onSuccess: () => void
}

const inputStyle = {
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
}

export default function StockInForm({ products, onSuccess }: StockInFormProps) {
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedProduct = products.find((p) => p.id === productId)
  const newStock = selectedProduct ? selectedProduct.stock + Number(quantity || 0) : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProduct || !quantity) return
    setSaving(true)

    await supabase
      .from('products')
      .update({ stock: selectedProduct.stock + Number(quantity) })
      .eq('id', selectedProduct.id)

    await supabase.from('stock_movements').insert({
      product_id: selectedProduct.id,
      change: Number(quantity),
      reason: 'stock_in',
    })

    setSaving(false)
    setProductId('')
    setQuantity('')
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: 12 }}>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
          style={{ ...inputStyle, flex: 2 }}
        >
          <option value="">Pilih Produk</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 28px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {saving ? 'Menyimpan...' : 'Tambah'}
        </button>
      </div>

      {selectedProduct && quantity && (
        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--color-text-muted)' }}>
          Stok saat ini: {selectedProduct.stock} {selectedProduct.unit} → Stok baru: {newStock} {selectedProduct.unit}
        </div>
      )}
    </form>
  )
}