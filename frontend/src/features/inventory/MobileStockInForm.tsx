import { useMemo, useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/product'

interface MobileStockInFormProps {
  products: Product[]
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

export default function MobileStockInForm({ products, onSuccess, onCancel }: MobileStockInFormProps) {
  const [selectedName, setSelectedName] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
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

  function handleSelectName(name: string) {
    setSelectedName(name)
    setDropdownOpen(false)
    setSearch('')
    const variants = groupedByName.get(name) ?? []
    setSelectedProductId(variants.length === 1 ? variants[0].id : '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProduct || !quantity) return
    setSaving(true)

    await supabase.from('products').update({ stock: selectedProduct.stock + quantity }).eq('id', selectedProduct.id)
    await supabase.from('stock_movements').insert({
      product_id: selectedProduct.id,
      change: quantity,
      reason: 'stock_in',
    })

    setSaving(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: 'var(--color-text)', fontSize: 20 }}>Tambah Stok</h2>
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

      <div style={{ marginBottom: 16, position: 'relative' }}>
        <label style={labelStyle}>Pilih produk</label>
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          style={{
            ...inputStyle,
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <span style={{ color: selectedName ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
            {selectedName || 'Cari produk'}
          </span>
          <ChevronDown size={14} />
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              boxShadow: 'var(--shadow-card)',
              zIndex: 10,
              maxHeight: 220,
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
              >
                {name}
                {(groupedByName.get(name)?.length ?? 0) > 1 && (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}> · {groupedByName.get(name)?.length} varian</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {hasMultipleVariants && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Varian</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">Pilih Varian</option>
            {variantsForSelectedName.map((p) => (
              <option key={p.id} value={p.id}>
                {p.variant || 'Tanpa varian'}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Jumlah stok</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            style={{ width: 44, borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface-muted)', color: 'var(--color-text)', fontSize: 18, cursor: 'pointer' }}
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            style={{ ...inputStyle, flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 16 }}
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            style={{ width: 44, borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface-muted)', color: 'var(--color-text)', fontSize: 18, cursor: 'pointer' }}
          >
            +
          </button>
        </div>
        {selectedProduct && (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
            Stok saat ini: {selectedProduct.stock} {selectedProduct.unit} → Stok baru: {selectedProduct.stock + quantity} {selectedProduct.unit}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving || !selectedProduct}
        style={{
          width: '100%',
          padding: 14,
          borderRadius: 12,
          border: 'none',
          background: 'var(--color-primary-solid)',
          color: 'var(--color-on-primary)',
          fontWeight: 700,
          cursor: saving || !selectedProduct ? 'not-allowed' : 'pointer',
          opacity: saving || !selectedProduct ? 0.6 : 1,
        }}
      >
        {saving ? 'Menyimpan...' : 'Simpan Tambah Stok'}
      </button>
    </form>
  )
}