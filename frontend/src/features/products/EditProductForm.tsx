import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ImageCropUpload from '@/components/ImageCropUpload/ImageCropUpload'
import type { Product } from '@/types/product'

interface EditProductFormProps {
  product: Product
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

async function uploadImageIfNeeded(dataUrl: string | null, productId: string): Promise<string | null> {
  if (!dataUrl) return null
  if (!dataUrl.startsWith('data:')) return dataUrl // already an uploaded URL, unchanged

  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const path = `${productId}-${Date.now()}.jpg`

  const { error } = await supabase.storage.from('product-images').upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (error) return null

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export default function EditProductForm({ product, onSuccess, onCancel }: EditProductFormProps) {
  const [name, setName] = useState(product.name)
  const [category, setCategory] = useState<'sembako' | 'plastik'>(product.category)
  const [purchasePrice, setPurchasePrice] = useState(String(product.purchase_price))
  const [sellingPrice, setSellingPrice] = useState(String(product.selling_price))
  const [unit, setUnit] = useState(product.unit)
  const [minStock, setMinStock] = useState(String(product.min_stock))
  const [image, setImage] = useState<string | null>(product.image_url)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const newPurchasePrice = Number(purchasePrice)
    const newSellingPrice = Number(sellingPrice)
    const pricesChanged =
      newPurchasePrice !== product.purchase_price || newSellingPrice !== product.selling_price

    const imageUrl = await uploadImageIfNeeded(image, product.id)

    const { error } = await supabase
      .from('products')
      .update({
        name,
        category,
        purchase_price: newPurchasePrice,
        selling_price: newSellingPrice,
        unit,
        min_stock: Number(minStock),
        image_url: imageUrl,
      })
      .eq('id', product.id)

    if (!error && pricesChanged) {
      await supabase.from('price_history').insert({
        product_id: product.id,
        old_purchase_price: product.purchase_price,
        new_purchase_price: newPurchasePrice,
        old_selling_price: product.selling_price,
        new_selling_price: newSellingPrice,
      })
    }

    setSaving(false)
    if (!error) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: 'var(--color-text)' }}>Edit Produk</h2>
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
        <input placeholder="Nama Produk" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />

        <div style={{ display: 'flex', gap: 14 }}>
          <select value={category} onChange={(e) => setCategory(e.target.value as 'sembako' | 'plastik')} style={{ ...inputStyle, flex: 1 }}>
            <option value="sembako">Sembako</option>
            <option value="plastik">Plastik</option>
          </select>
          <input placeholder="Satuan" value={unit} onChange={(e) => setUnit(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <input type="number" placeholder="Harga Beli" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
          <input type="number" placeholder="Harga Jual" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
        </div>

        <input type="number" placeholder="Stok Minimum" value={minStock} onChange={(e) => setMinStock(e.target.value)} required style={inputStyle} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <button
          type="submit"
          disabled={saving}
          style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  )
}