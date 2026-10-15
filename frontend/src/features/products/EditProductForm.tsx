import { useEffect, useMemo, useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ImageCropUpload from '@/components/ImageCropUpload/ImageCropUpload'
import FormattedNumberInput from '@/components/FormattedNumberInput/FormattedNumberInput'
import { flattenUnitRows, type UnitRowInput } from '@/lib/units'
import type { Product } from '@/types/product'
import type { ProductUnit } from '@/types/productUnit'

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
  background: 'var(--color-surface-muted)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
}

const labelStyle = {
  fontSize: 12,
  color: 'var(--color-text-muted)',
  marginBottom: 6,
  display: 'block',
}

const MAX_UNITS = 5

function emptyUnitRow(): UnitRowInput {
  return { unitName: '', breakdownQty: '', purchasePrice: '', sellingPrice: '' }
}

async function uploadImageIfNeeded(dataUrl: string | null, productId: string, existingUrl: string | null): Promise<string | null> {
  if (!dataUrl) return null
  if (!dataUrl.startsWith('data:')) return dataUrl

  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const path = `${productId}-${Date.now()}.jpg`

  const { error } = await supabase.storage.from('product-images').upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (error) {
    console.error('Gagal mengunggah foto produk:', error)
    return existingUrl
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export default function EditProductForm({ product, onSuccess, onCancel }: EditProductFormProps) {
  const [name, setName] = useState(product.name)
  const [category, setCategory] = useState<'sembako' | 'plastik'>(product.category)
  const [image, setImage] = useState<string | null>(product.image_url)
  const [saving, setSaving] = useState(false)
  const [variant, setVariant] = useState(product.variant ?? '')
  const [expiryDate, setExpiryDate] = useState(product.expiry_date ?? '')
  const [loadingUnits, setLoadingUnits] = useState(true)

  const [purchasePrice, setPurchasePrice] = useState(String(product.purchase_price))
  const [sellingPrice, setSellingPrice] = useState(String(product.selling_price))
  const [unit, setUnit] = useState(product.unit)
  const [minStock, setMinStock] = useState(String(product.min_stock))

  const [unitCount, setUnitCount] = useState(1)
  const [unitRows, setUnitRows] = useState<UnitRowInput[]>([emptyUnitRow(), emptyUnitRow()])
  const [minStockQty, setMinStockQty] = useState(String(product.min_stock))
  const [minStockUnit, setMinStockUnit] = useState(product.unit)

  const isMultiUnit = unitCount > 1

  useEffect(() => {
    let cancelled = false
    supabase
      .from('product_units')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data && data.length > 0) {
          const existing = data as ProductUnit[]
          const rows: UnitRowInput[] = existing.map((u, i) => {
            const nextFactor = i + 1 < existing.length ? existing[i + 1].factor_to_base : 1
            return {
              unitName: u.unit_name,
              breakdownQty: String(u.factor_to_base / nextFactor),
              purchasePrice: String(u.purchase_price),
              sellingPrice: String(u.selling_price),
            }
          })
          rows.push({ unitName: product.unit, breakdownQty: '', purchasePrice: String(product.purchase_price), sellingPrice: String(product.selling_price) })
          setUnitRows(rows)
          setUnitCount(rows.length)
        }
        setLoadingUnits(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  const flattenedUnits = useMemo(() => (isMultiUnit ? flattenUnitRows(unitRows.slice(0, unitCount)) : []), [isMultiUnit, unitRows, unitCount])
  const baseUnit = flattenedUnits[flattenedUnits.length - 1]

  function updateUnitCount(next: number) {
    const clamped = Math.max(1, Math.min(MAX_UNITS, next))
    setUnitCount(clamped)
    setUnitRows((prev) => {
      const rows = [...prev]
      while (rows.length < clamped) rows.push(emptyUnitRow())
      return rows
    })
  }

  function updateUnitRow(index: number, field: keyof UnitRowInput, value: string) {
    setUnitRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function minStockInBaseUnit(): number {
    if (!isMultiUnit) return Number(minStock || 0)
    const match = flattenedUnits.find((u) => u.unit_name === minStockUnit)
    if (!match) return 0
    return Number(minStockQty || 0) * match.factor_to_base
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isMultiUnit && (!baseUnit || !minStockUnit)) return
    setSaving(true)

    const newPurchasePrice = isMultiUnit ? baseUnit.purchase_price : Number(purchasePrice)
    const newSellingPrice = isMultiUnit ? baseUnit.selling_price : Number(sellingPrice)
    const newUnit = isMultiUnit ? baseUnit.unit_name : unit
    const newMinStock = minStockInBaseUnit()
    const pricesChanged = newPurchasePrice !== product.purchase_price || newSellingPrice !== product.selling_price

    const imageUrl = await uploadImageIfNeeded(image, product.id, product.image_url)

    const { error } = await supabase
      .from('products')
      .update({
        name,
        category,
        purchase_price: newPurchasePrice,
        selling_price: newSellingPrice,
        unit: newUnit,
        min_stock: newMinStock,
        image_url: imageUrl,
        variant: variant || null,
        expiry_date: category === 'sembako' && expiryDate ? expiryDate : null,
      })
      .eq('id', product.id)

    if (error) {
      console.error('Gagal menyimpan perubahan produk:', error)
      setSaving(false)
      return
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

    await supabase.from('product_units').delete().eq('product_id', product.id)
    if (isMultiUnit) {
      const extraUnits = flattenedUnits.slice(0, flattenedUnits.length - 1)
      if (extraUnits.length > 0) {
        const { error: unitsError } = await supabase.from('product_units').insert(
          extraUnits.map((u) => ({
            product_id: product.id,
            unit_name: u.unit_name,
            factor_to_base: u.factor_to_base,
            purchase_price: u.purchase_price,
            selling_price: u.selling_price,
            sort_order: u.sort_order,
          }))
        )
        if (unitsError) console.error('Gagal menyimpan satuan produk:', unitsError)
      }
    }

    setSaving(false)
    onSuccess()
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

        <div>
          <label style={labelStyle}>Kategori</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as 'sembako' | 'plastik')} style={inputStyle}>
            <option value="sembako">Sembako</option>
            <option value="plastik">Plastik</option>
          </select>
        </div>

        {category === 'sembako' && (
          <div>
            <label style={labelStyle}>Tanggal Kadaluwarsa (opsional)</label>
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={inputStyle} />
          </div>
        )}

        {!loadingUnits && (
          <div>
            <label style={labelStyle}>Jumlah Satuan</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => updateUnitCount(unitCount - 1)}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-muted)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={14} />
              </button>
              <span style={{ fontWeight: 700, fontSize: 15, minWidth: 16, textAlign: 'center' }}>{unitCount}</span>
              <button
                type="button"
                onClick={() => updateUnitCount(unitCount + 1)}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-muted)', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={14} />
              </button>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {isMultiUnit ? 'Satuan diisi manual di bawah, dari terbesar ke terkecil' : 'Produk ini cuma punya 1 satuan'}
              </span>
            </div>
          </div>
        )}

        {!isMultiUnit && (
          <>
            <div>
              <label style={labelStyle}>Satuan</label>
              <input placeholder="Contoh: pcs, pak, kg" value={unit} onChange={(e) => setUnit(e.target.value)} required style={inputStyle} />
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
              <input type="number" placeholder="0" value={minStock} onChange={(e) => setMinStock(e.target.value)} required style={inputStyle} />
            </div>
          </>
        )}

        {isMultiUnit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {unitRows.slice(0, unitCount).map((row, i) => {
              const isLast = i === unitCount - 1
              return (
                <div key={i} style={{ padding: 12, borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface-muted)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    {isLast ? 'Satuan terkecil (base)' : `Satuan ${i + 1}`}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 110 }}>
                      <label style={labelStyle}>Nama Satuan</label>
                      <input
                        placeholder="Contoh: ikat"
                        value={row.unitName}
                        onChange={(e) => updateUnitRow(i, 'unitName', e.target.value)}
                        required
                        style={inputStyle}
                      />
                    </div>
                    {!isLast && (
                      <div style={{ flex: 1, minWidth: 110 }}>
                        <label style={labelStyle}>
                          1 {row.unitName || 'satuan ini'} = berapa {unitRows[i + 1]?.unitName || 'satuan berikutnya'}?
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={row.breakdownQty}
                          onChange={(e) => updateUnitRow(i, 'breakdownQty', e.target.value)}
                          required
                          style={inputStyle}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 110 }}>
                      <label style={labelStyle}>Harga Beli</label>
                      <FormattedNumberInput placeholder="0" value={row.purchasePrice} onChange={(v) => updateUnitRow(i, 'purchasePrice', v)} required style={inputStyle} />
                    </div>
                    <div style={{ flex: 1, minWidth: 110 }}>
                      <label style={labelStyle}>Harga Jual</label>
                      <FormattedNumberInput placeholder="0" value={row.sellingPrice} onChange={(v) => updateUnitRow(i, 'sellingPrice', v)} required style={inputStyle} />
                    </div>
                  </div>
                </div>
              )
            })}

            <div>
              <label style={labelStyle}>Stok Minimum</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" placeholder="0" value={minStockQty} onChange={(e) => setMinStockQty(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
                <select value={minStockUnit} onChange={(e) => setMinStockUnit(e.target.value)} required style={{ ...inputStyle, flex: 1 }}>
                  <option value="">Satuan</option>
                  {flattenedUnits.map((u) => (
                    <option key={u.unit_name} value={u.unit_name}>
                      {u.unit_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <button
          type="submit"
          disabled={saving}
          style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: 'var(--color-primary-solid)', color: 'var(--color-on-primary)', fontWeight: 600, cursor: 'pointer' }}
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  )
}