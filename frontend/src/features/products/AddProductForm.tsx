import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ImageCropUpload from '@/components/ImageCropUpload/ImageCropUpload'

interface AddProductFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
}

export default function AddProductForm({ onSuccess, onCancel }: AddProductFormProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'sembako' | 'plastik'>('sembako')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [unit, setUnit] = useState('')
  const [variant, setVariant] = useState('')
  const [stock, setStock] = useState('')
  const [minStock, setMinStock] = useState('')
  const [saving, setSaving] = useState(false)
  const [image, setImage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setSaving(true)

  const { data: inserted, error } = await supabase
  .from('products')
  .insert({
    name,
    category,
    variant: variant || null,
    purchase_price: Number(purchasePrice),
    selling_price: Number(sellingPrice),
    unit,
    stock: Number(stock),
    min_stock: Number(minStock),
  })
  .select()
  .single()

if (error) {
  console.error('Gagal menyimpan produk:', error)
}

if (!error && inserted && image) {
  const res = await fetch(image)
  const blob = await res.blob()
  const path = `${inserted.id}-${Date.now()}.jpg`
  const { error: uploadError } = await supabase.storage.from('product-images').upload(path, blob, {
    contentType: 'image/jpeg',
  })
  if (uploadError) {
    console.error('Gagal mengunggah foto produk:', uploadError)
  } else {
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
    await supabase.from('products').update({ image_url: urlData.publicUrl }).eq('id', inserted.id)
  }
}

  setSaving(false)
  if (!error) onSuccess()
}

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: 'var(--color-text)' }}>Buat Produk Baru</h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup"
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

      <div style={{ marginBottom: 20 }}>
        <ImageCropUpload value={image} onChange={setImage} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          placeholder="Nama Produk"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />

        <input
  placeholder="Varian / Ukuran (cth. 1kg, 250ml) — opsional"
  value={variant}
  onChange={(e) => setVariant(e.target.value)}
  style={inputStyle}
/>

        <div style={{ display: 'flex', gap: 14 }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'sembako' | 'plastik')}
            style={{ ...inputStyle, flex: 1 }}
          >
            <option value="sembako">Sembako</option>
            <option value="plastik">Plastik</option>
          </select>
          <input
            placeholder="Satuan (cth. pcs)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <input
            type="number"
            placeholder="Harga Beli"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            required
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="number"
            placeholder="Harga Jual"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <input
            type="number"
            placeholder="Stok Awal"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="number"
            placeholder="Stok Minimum"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            required
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
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
          }}
        >
          {saving ? 'Menyimpan...' : 'Simpan Produk'}
        </button>
      </div>
    </form>
  )
}