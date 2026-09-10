import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AddProductFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function AddProductForm({ onSuccess, onCancel }: AddProductFormProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'sembako' | 'plastik'>('sembako')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [unit, setUnit] = useState('pcs')
  const [stock, setStock] = useState('')
  const [minStock, setMinStock] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from('products').insert({
      name,
      category,
      purchase_price: Number(purchasePrice),
      selling_price: Number(sellingPrice),
      unit,
      stock: Number(stock),
      min_stock: Number(minStock),
    })

    setSaving(false)
    if (!error) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 320 }}>
      <input placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />

      <select value={category} onChange={(e) => setCategory(e.target.value as 'sembako' | 'plastik')} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
        <option value="sembako">Sembako</option>
        <option value="plastik">Plastik</option>
      </select>

      <input placeholder="Purchase price" type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
      <input placeholder="Selling price" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
      <input placeholder="Unit (pcs, pak, kg, etc)" value={unit} onChange={(e) => setUnit(e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
      <input placeholder="Initial stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
      <input placeholder="Minimum stock" type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={onCancel} style={{ padding: 8, borderRadius: 6 }}>Cancel</button>
        <button type="submit" disabled={saving} style={{ padding: 8, borderRadius: 6, background: '#95B1EE', border: 'none' }}>
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  )
}