import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/product'

interface StockInFormProps {
  products: Product[]
  onSuccess: () => void
  onCancel: () => void
}

export default function StockInForm({ products, onSuccess, onCancel }: StockInFormProps) {
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
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 320 }}>
      <select
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        required
        style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
      >
        <option value="">Select product...</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {selectedProduct && (
        <div style={{ fontSize: 14, color: '#666' }}>
          Current Stock: {selectedProduct.stock} {selectedProduct.unit}
        </div>
      )}

      <input
        type="number"
        placeholder="Quantity added"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
        style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
      />

      {selectedProduct && quantity && (
        <div style={{ fontSize: 14, fontWeight: 600 }}>
          New Stock: {newStock} {selectedProduct.unit}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={onCancel} style={{ padding: 8, borderRadius: 6 }}>
          Cancel
        </button>
        <button type="submit" disabled={saving} style={{ padding: 8, borderRadius: 6, background: '#95B1EE', border: 'none' }}>
          {saving ? 'Saving...' : 'Add Stock'}
        </button>
      </div>
    </form>
  )
}