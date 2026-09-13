import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ImageCropUpload from '@/components/ImageCropUpload/ImageCropUpload'
import FormattedNumberInput from '@/components/FormattedNumberInput/FormattedNumberInput'

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

const labelStyle = {
  fontSize: 12,
  color: 'var(--color-text-muted)',
  marginBottom: 6,
  display: 'block',
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

    // 1. Upload foto dulu (kalau ada), sebelum produk dibuat sama sekali
    let imageUrl: string | null = null
    if (image) {
      const path = `${crypto.randomUUID()}.jpg`
      const res = await fetch(image)
      const blob = await res.blob()
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, blob, {
        contentType: 'image/jpeg',
      })
      if (uploadError) {
        console.error('Gagal mengunggah foto produk:', uploadError)
      } else {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
        imageUrl = urlData.publicUrl
      }
    }

    // 2. Baru insert produk, dengan image_url (kalau ada) langsung kesertain dalam satu langkah
    const { error } = await supabase.from('products').insert({
      name,
      category,
      variant: variant || null,
      purchase_price: Number(purchasePrice),
      selling_price: Number(sellingPrice),
      unit,
      stock: Number(stock),
      min_stock: Number(minStock),
      image_url: imageUrl,
    })

    if (error) {
      console.error('Gagal menyimpan produk:', error)
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
        <label style={labelStyle}>Foto Produk</label>
        <ImageCropUpload value={image} onChange={setImage} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Nama Produk</label>
          <input
            placeholder="Contoh: Beras"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'sembako' | 'plastik')}
              style={inputStyle}
            >
              <option value="sembako">Sembako</option>
              <option value="plastik">Plastik</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Satuan</label>
            <input
              placeholder="Contoh: pcs, pak, kg"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              style={inputStyle}
            />
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

        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Stok Awal</label>
            <input
              type="number"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
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