import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/product'

interface StockInFormProps {
  products: Product[]
  onSuccess: () => void
}

const inputStyle = {
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
}

export default function StockInForm({ products, onSuccess }: StockInFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [saving, setSaving] = useState(false)

  const filteredOptions = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  )

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
    setSelectedProduct(null)
    setSearch('')
    setQuantity('')
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', flex: 2 }}>
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
            <span style={{ color: selectedProduct ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
              {selectedProduct ? selectedProduct.name : 'Pilih Produk'}
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
                  borderBottom: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text)',
                  outline: 'none',
                }}
              />
              {filteredOptions.length === 0 && (
                <div style={{ padding: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>Tidak ditemukan</div>
              )}
              {filteredOptions.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p)
                    setDropdownOpen(false)
                    setSearch('')
                  }}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          type="number"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          type="submit"
          disabled={saving || !selectedProduct}
          style={{
            padding: '12px 28px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            opacity: saving || !selectedProduct ? 0.6 : 1,
          }}
        >
          {saving ? 'Menyimpan...' : 'Tambah'}
        </button>
      </div>

      {selectedProduct && quantity && (
        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--color-text-muted)' }}>
          Stok saat ini: {selectedProduct.stock} {selectedProduct.unit} → Stok baru: {newStock} {selectedProduct.unit}
        </div>
      )}
    </form>
  )
}