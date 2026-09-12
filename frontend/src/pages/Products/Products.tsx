import { useState } from 'react'
import { Plus, Search, List, Grid2x2, LayoutGrid, ChevronDown, Pencil, Trash2, Info, Check } from 'lucide-react'
import { useProducts } from '@/features/products/useProducts'
import AddProductForm from '@/features/products/AddProductForm'
import EditProductForm from '@/features/products/EditProductForm'
import PriceHistoryModal from '@/features/products/PriceHistoryModal'
import Card from '@/components/Card/Card'
import Modal from '@/components/Modal/Modal'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import CategoryBadge from '@/components/CategoryBadge/CategoryBadge'
import PageTopBar from '@/components/PageTopBar/PageTopBar'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/product'

type ViewMode = 'list' | 'large' | 'medium' | 'small'

const viewOptions: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
  { value: 'list', label: 'Daftar', icon: <List size={15} /> },
  { value: 'large', label: 'Ikon Besar', icon: <Grid2x2 size={15} /> },
  { value: 'medium', label: 'Ikon Sedang', icon: <LayoutGrid size={15} /> },
  { value: 'small', label: 'Ikon Kecil', icon: <LayoutGrid size={13} /> },
]

const sizeConfig: Record<Exclude<ViewMode, 'list'>, { minWidth: number; avatar: number; font: number }> = {
  large: { minWidth: 200, avatar: 90, font: 14 },
  medium: { minWidth: 150, avatar: 64, font: 13 },
  small: { minWidth: 100, avatar: 40, font: 11 },
}

function iconButtonStyle(bg: string, color: string) {
  return {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: 'none',
    background: bg,
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  }
}

export default function Products() {
  const { products, loading, refetch } = useProducts()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [viewMenuOpen, setViewMenuOpen] = useState(false)

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete() {
    if (!deletingProduct) return
    await supabase.from('products').delete().eq('id', deletingProduct.id)
    setDeletingProduct(null)
    refetch()
  }

  return (
    <div>
      <PageTopBar
        title="Produk"
        action={
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 24,
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Tambah Produk
          </button>
        }
      />

      <Card style={{ boxShadow: 'var(--shadow-card)', minHeight: '70vh' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              color="var(--color-text-muted)"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setViewMenuOpen((v) => !v)}
              style={{
                height: '100%',
                padding: '0 12px',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
            >
              <LayoutGrid size={16} />
              <ChevronDown size={14} />
            </button>

            {viewMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  boxShadow: 'var(--shadow-card)',
                  padding: 6,
                  zIndex: 10,
                  width: 190,
                }}
              >
                {viewOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setViewMode(opt.value)
                      setViewMenuOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: viewMode === opt.value ? 'var(--color-bg)' : 'transparent',
                      color: 'var(--color-text)',
                      cursor: 'pointer',
                      fontSize: 13,
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {opt.icon}
                      {opt.label}
                    </span>
                    {viewMode === opt.value && <Check size={14} color="var(--color-primary)" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p>Memuat...</p>
        ) : viewMode === 'list' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>No.</th>
                <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Produk</th>
                <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Varian</th>
                <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Kategori</th>
                <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Harga Beli</th>
                <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Harga Jual</th>
                <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Stok</th>
                <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Satuan</th>
                <th style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 14, color: 'var(--color-text-muted)' }}>{i + 1}</td>
                  <td style={{ padding: 14, fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: 14, color: 'var(--color-text-muted)' }}>{p.variant || '-'}</td>
                  <td style={{ padding: 14 }}>
                    <CategoryBadge category={p.category} />
                  </td>
                  <td style={{ padding: 14 }}>Rp{p.purchase_price.toLocaleString('id-ID')}</td>
                  <td style={{ padding: 14 }}>Rp{p.selling_price.toLocaleString('id-ID')}</td>
                  <td style={{ padding: 14 }}>{p.stock}</td>
                  <td style={{ padding: 14 }}>{p.unit}</td>
                  <td style={{ padding: 14 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setHistoryProduct(p)}
                        aria-label="Riwayat harga"
                        style={iconButtonStyle('rgba(149,177,238,0.15)', 'var(--color-primary)')}
                      >
                        <Info size={14} />
                      </button>
                      <button
                        onClick={() => setEditingProduct(p)}
                        aria-label="Edit"
                        style={iconButtonStyle('rgba(231,241,168,0.5)', '#7a8a2e')}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingProduct(p)}
                        aria-label="Hapus"
                        style={iconButtonStyle('rgba(231,76,60,0.12)', '#c0392b')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, minmax(${sizeConfig[viewMode].minWidth}px, 1fr))`,
              gap: 12,
            }}
          >
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => setEditingProduct(p)}
                    aria-label="Edit"
                    style={{ ...iconButtonStyle('rgba(231,241,168,0.6)', '#7a8a2e'), width: 24, height: 24 }}
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={() => setDeletingProduct(p)}
                    aria-label="Hapus"
                    style={{ ...iconButtonStyle('rgba(231,76,60,0.15)', '#c0392b'), width: 24, height: 24 }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
                <div
                  style={{
                    width: sizeConfig[viewMode].avatar,
                    height: sizeConfig[viewMode].avatar,
                    borderRadius: 12,
                    background: 'var(--color-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    fontWeight: 700,
                    fontSize: sizeConfig[viewMode].avatar / 2.5,
                    overflow: 'hidden',
                  }}
                >
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    p.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ fontSize: sizeConfig[viewMode].font, fontWeight: 600 }}>{p.name}</div>
                {p.variant && (
                  <div style={{ fontSize: sizeConfig[viewMode].font - 2, color: 'var(--color-text-muted)' }}>{p.variant}</div>
                )}
                <div style={{ fontSize: sizeConfig[viewMode].font - 1, color: 'var(--color-text-muted)' }}>
                  Rp{p.selling_price.toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize: sizeConfig[viewMode].font - 1, color: 'var(--color-text-muted)' }}>
                  {p.stock} {p.unit}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showAddForm && (
        <Modal onClose={() => setShowAddForm(false)}>
          <AddProductForm
            onSuccess={() => {
              setShowAddForm(false)
              refetch()
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </Modal>
      )}

      {editingProduct && (
        <Modal onClose={() => setEditingProduct(null)}>
          <EditProductForm
            product={editingProduct}
            onSuccess={() => {
              setEditingProduct(null)
              refetch()
            }}
            onCancel={() => setEditingProduct(null)}
          />
        </Modal>
      )}

      {deletingProduct && (
        <ConfirmModal
          title="Hapus Produk"
          description={`Yakin ingin menghapus "${deletingProduct.name}"? Tindakan ini tidak bisa dibatalkan.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingProduct(null)}
        />
      )}

      {historyProduct && (
        <PriceHistoryModal
          productId={historyProduct.id}
          productName={historyProduct.name}
          onClose={() => setHistoryProduct(null)}
        />
      )}
    </div>
  )
}