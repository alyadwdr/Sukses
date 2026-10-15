import { useMemo, useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ImageCropUpload from '@/components/ImageCropUpload/ImageCropUpload'
import FormattedNumberInput from '@/components/FormattedNumberInput/FormattedNumberInput'
import { flattenUnitRows, type UnitRowInput } from '@/lib/units'

interface AddProductFormProps {
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

export default function AddProductForm({ onSuccess, onCancel }: AddProductFormProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'sembako' | 'plastik'>('sembako')
  const [variant, setVariant] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [autoExpense, setAutoExpense] = useState(true)

  // Jalur satuan tunggal (perilaku lama, dipakai saat jumlah satuan = 1)
  const [purchasePrice, setPurchasePrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [unit, setUnit] = useState('')
  const [stock, setStock] = useState('')
  const [minStock, setMinStock] = useState('')

  // Jalur multi-satuan
  const [unitCount, setUnitCount] = useState(1)
  const [unitRows, setUnitRows] = useState<UnitRowInput[]>([emptyUnitRow(), emptyUnitRow()])
  const [stockQty, setStockQty] = useState('')
  const [stockUnit, setStockUnit] = useState('')
  const [minStockQty, setMinStockQty] = useState('')
  const [minStockUnit, setMinStockUnit] = useState('')

  const isMultiUnit = unitCount > 1

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
    setStockUnit('')
    setMinStockUnit('')
  }

  function updateUnitRow(index: number, field: keyof UnitRowInput, value: string) {
    setUnitRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function stockInBaseUnit(qty: string, unitName: string): number {
    if (!isMultiUnit) return Number(qty || 0)
    const match = flattenedUnits.find((u) => u.unit_name === unitName)
    if (!match) return 0
    return Number(qty || 0) * match.factor_to_base
  }

  const stockAwalBase = isMultiUnit ? stockInBaseUnit(stockQty, stockUnit) : Number(stock || 0)
  const stockAwalPreviewUnit = isMultiUnit ? flattenedUnits.find((u) => u.unit_name === stockUnit) : null
  const stockAwalModal = stockAwalPreviewUnit ? Number(stockQty || 0) * stockAwalPreviewUnit.purchase_price : 0
  const stockAwalNilaiJual = stockAwalPreviewUnit ? Number(stockQty || 0) * stockAwalPreviewUnit.selling_price : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isMultiUnit && (!baseUnit || !stockUnit || !minStockUnit)) return
    setSaving(true)

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

    const finalUnit = isMultiUnit ? baseUnit.unit_name : unit
    const finalPurchasePrice = isMultiUnit ? baseUnit.purchase_price : Number(purchasePrice)
    const finalSellingPrice = isMultiUnit ? baseUnit.selling_price : Number(sellingPrice)
    const finalStock = isMultiUnit ? stockAwalBase : Number(stock)
    const finalMinStock = isMultiUnit ? stockInBaseUnit(minStockQty, minStockUnit) : Number(minStock)

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        category,
        variant: variant || null,
        expiry_date: category === 'sembako' && expiryDate ? expiryDate : null,
        purchase_price: finalPurchasePrice,
        selling_price: finalSellingPrice,
        unit: finalUnit,
        stock: finalStock,
        min_stock: finalMinStock,
        image_url: imageUrl,
      })
      .select()
      .single()

    if (error) {
      console.error('Gagal menyimpan produk:', error)
      setSaving(false)
      return
    }

    if (isMultiUnit) {
      const extraUnits = flattenedUnits.slice(0, flattenedUnits.length - 1)
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

    if (autoExpense && finalStock > 0) {
      const modal = finalStock * finalPurchasePrice
      await supabase.from('expenses').insert({
        description: `Stok awal: ${name}`,
        category: 'Belanja stok',
        amount: modal,
        expense_date: new Date().toISOString().slice(0, 10),
      })
    }

    setSaving(false)
    onSuccess()
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

        <div>
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

        {category === 'sembako' && (
          <div>
            <label style={labelStyle}>Tanggal Kadaluwarsa (opsional)</label>
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={inputStyle} />
          </div>
        )}

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

        {!isMultiUnit && (
          <>
            <div>
              <label style={labelStyle}>Satuan</label>
              <input
                placeholder="Contoh: pcs, pak, kg"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                style={inputStyle}
              />
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
                <input type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} required style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Stok Minimum</label>
                <input type="number" placeholder="0" value={minStock} onChange={(e) => setMinStock(e.target.value)} required style={inputStyle} />
              </div>
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

            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Stok Awal</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" placeholder="0" value={stockQty} onChange={(e) => setStockQty(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
                  <select value={stockUnit} onChange={(e) => setStockUnit(e.target.value)} required style={{ ...inputStyle, flex: 1 }}>
                    <option value="">Satuan</option>
                    {flattenedUnits.map((u) => (
                      <option key={u.unit_name} value={u.unit_name}>
                        {u.unit_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ flex: 1 }}>
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

            {stockUnit && stockQty && (
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                ≈ {stockAwalBase} {baseUnit?.unit_name} · Modal awal Rp{stockAwalModal.toLocaleString('id-ID')} · Nilai jual Rp{stockAwalNilaiJual.toLocaleString('id-ID')}
              </div>
            )}
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text)', marginTop: 4 }}>
          <input type="checkbox" checked={autoExpense} onChange={(e) => setAutoExpense(e.target.checked)} />
          Catat stok awal ini sebagai pengeluaran "Belanja stok"
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 28px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--color-primary-solid)',
            color: 'var(--color-on-primary)',
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