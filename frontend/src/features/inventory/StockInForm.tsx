import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useProductUnits } from '@/features/products/useProductUnits'
import { allUnitsForProduct } from '@/lib/units'
import type { Product } from '@/types/product'

interface StockInFormProps {
  products: Product[]
  onSuccess: () => void
}

const inputStyle = {
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-muted)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
}

export default function StockInForm({ products, onSuccess }: StockInFormProps) {
  const { unitsByProduct } = useProductUnits()
  const [selectedName, setSelectedName] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [unitName, setUnitName] = useState('')
  const [autoExpense, setAutoExpense] = useState(true)
  const [saving, setSaving] = useState(false)

  const groupedByName = useMemo(() => {
    const map = new Map<string, Product[]>()
    for (const p of products) {
      const list = map.get(p.name) ?? []
      list.push(p)
      map.set(p.name, list)
    }
    return map
  }, [products])

  const uniqueNames = Array.from(groupedByName.keys())
  const filteredNames = uniqueNames.filter((n) => n.toLowerCase().includes(search.toLowerCase()))

  const variantsForSelectedName = selectedName ? groupedByName.get(selectedName) ?? [] : []
  const hasMultipleVariants = variantsForSelectedName.length > 1

  const selectedProduct = variantsForSelectedName.find((p) => p.id === selectedProductId) ?? null

  const productUnits = useMemo(
    () => (selectedProduct ? allUnitsForProduct(selectedProduct, unitsByProduct(selectedProduct.id)) : []),
    [selectedProduct, unitsByProduct]
  )
  const isMultiUnit = productUnits.length > 1
  const selectedUnit = productUnits.find((u) => u.unit_name === unitName) ?? productUnits[productUnits.length - 1] ?? null

  function handleSelectName(name: string) {
    setSelectedName(name)
    setDropdownOpen(false)
    setSearch('')
    const variants = groupedByName.get(name) ?? []
    setSelectedProductId(variants.length === 1 ? variants[0].id : '')
    setUnitName('')
  }

  const qtyInBase = selectedUnit ? Number(quantity || 0) * selectedUnit.factor_to_base : 0
  const newStock = selectedProduct ? selectedProduct.stock + qtyInBase : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProduct || !quantity || !selectedUnit) return
    setSaving(true)

    await supabase
      .from('products')
      .update({ stock: selectedProduct.stock + qtyInBase })
      .eq('id', selectedProduct.id)

    await supabase.from('stock_movements').insert({
      product_id: selectedProduct.id,
      change: qtyInBase,
      reason: 'stock_in',
    })

    if (autoExpense) {
      await supabase.from('expenses').insert({
        description: `Stok masuk: ${selectedProduct.name}`,
        category: 'Belanja stok',
        amount: Number(quantity) * selectedUnit.purchase_price,
        expense_date: new Date().toISOString().slice(0, 10),
      })
    }

    setSaving(false)
    setSelectedName('')
    setSelectedProductId('')
    setSearch('')
    setQuantity('')
    setUnitName('')
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 2, minWidth: 200 }}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            style={{
              ...inputStyle,
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{ color: selectedName ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
              {selectedName || 'Pilih Produk'}
            </span>
            <ChevronDown size={14} />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                right: 0,
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                boxShadow: 'var(--shadow-card)',
                zIndex: 10,
                maxHeight: 260,
                overflowY: 'auto',
              }}
            >
              <input
                autoFocus
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: 'none',
                  borderBottom: '1px solid var(--color-divider)',
                  background: 'transparent',
                  color: 'var(--color-text)',
                  outline: 'none',
                }}
              />
              {filteredNames.length === 0 && (
                <div style={{ padding: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>Tidak ditemukan</div>
              )}
              {filteredNames.map((name) => (
                <div
                  key={name}
                  onClick={() => handleSelectName(name)}
                  style={{ padding: '10px 12px', cursor: 'pointer', fontSize: 14 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {name}
                  {(groupedByName.get(name)?.length ?? 0) > 1 && (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                      {' '}
                      · {groupedByName.get(name)?.length} varian
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {hasMultipleVariants && (
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value)
              setUnitName('')
            }}
            required
            style={{ ...inputStyle, flex: 1, minWidth: 140 }}
          >
            <option value="">Pilih Varian</option>
            {variantsForSelectedName.map((p) => (
              <option key={p.id} value={p.id}>
                {p.variant || 'Tanpa varian'}
              </option>
            ))}
          </select>
        )}

        <input
          type="number"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          style={{ ...inputStyle, flex: 1, minWidth: 100 }}
        />

        {isMultiUnit && (
          <select value={unitName} onChange={(e) => setUnitName(e.target.value)} required style={{ ...inputStyle, flex: 1, minWidth: 110 }}>
            <option value="">Satuan</option>
            {productUnits.map((u) => (
              <option key={u.unit_name} value={u.unit_name}>
                {u.unit_name}
              </option>
            ))}
          </select>
        )}

        <button
          type="submit"
          disabled={saving || !selectedProduct || (isMultiUnit && !unitName)}
          style={{
            padding: '12px 28px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--color-primary-solid)',
            color: 'var(--color-on-primary)',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            opacity: saving || !selectedProduct || (isMultiUnit && !unitName) ? 0.6 : 1,
          }}
        >
          {saving ? 'Menyimpan...' : 'Tambah'}
        </button>
      </div>

      {selectedProduct && quantity && selectedUnit && (
        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--color-text-muted)' }}>
          Stok saat ini: {selectedProduct.stock} {selectedProduct.unit} → Stok baru: {newStock} {selectedProduct.unit}
        </div>
      )}

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text)', marginTop: 10 }}>
        <input type="checkbox" checked={autoExpense} onChange={(e) => setAutoExpense(e.target.checked)} />
        Catat sebagai pengeluaran "Belanja stok"
      </label>
    </form>
  )
}