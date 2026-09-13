import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ImageCropUpload from '@/components/ImageCropUpload/ImageCropUpload'
import FormattedNumberInput from '@/components/FormattedNumberInput/FormattedNumberInput'
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

const labelStyle = {
  fontSize: 12,
  color: 'var(--color-text-muted)',
  marginBottom: 6,
  display: 'block',
}

async function uploadImageIfNeeded(dataUrl: string | null, productId: string, existingUrl: string | null): Promise<string | null> {
  if (!dataUrl) return null // fotonya sengaja dihapus user
  if (!dataUrl.startsWith('data:')) return dataUrl // nggak berubah, tetap URL yang sudah ada

  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const path = `${productId}-${Date.now()}.jpg`

  const { error } = await supabase.storage.from('product-images').upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (error) {
    console.error('Gagal mengunggah foto produk:', error)
    return existingUrl // gagal upload, jangan hapus foto lama
  }

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
  const [variant, setVariant] = useState(product.variant ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const newPurchasePrice = Number(purchasePrice)
    const newSellingPrice = Number(sellingPrice)
    const pricesChanged =
      newPurchasePrice !== product.purchase_price || newSellingPrice !== product.selling_price

    const imageUrl = await uploadImageIfNeeded(image, product.id, product.image_url)

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
        variant: variant || null,
      })
      .eq('id', product.id)

    if (error) {
      console.error('Gagal menyimpan perubahan produk:', error)
    }

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
        <label style={labelStyle}>Foto Produk</label>
        <ImageCropUpload value={image} onChange={setImage} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Nama Produk</label>
          <input placeholder="Contoh: Beras" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Varian / Ukuran (opsional)</label>
          <input
            placeholder="Contoh: 1kg, 250ml"
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as 'sembako' | 'plastik')} style={inputStyle}>
              <option value="sembako">Sembako</option>
              <option value="plastik">Plastik</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Satuan</label>
            <input placeholder="Contoh: pcs, pak, kg" value={unit} onChange={(e) => setUnit(e.target.value)} required style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Harga Beli</label>
            <FormattedNumberInput placeholder="0" value={purchasePrice} onChange={setPurchasePrice} required style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Harga Jual</label>
            <FormattedNumberInput placeholder="0" value={sellingPrice} onChange={setSellingPrice} required style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Stok Minimum</label>
          <input
            type="number"
            placeholder="0"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
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