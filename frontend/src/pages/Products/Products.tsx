import { useState } from 'react'
import { useProducts } from '@/features/products/useProducts'
import AddProductForm from '@/features/products/AddProductForm'
import PageHeader from '@/components/PageHeader/PageHeader'

export default function Products() {
  const { products, loading, refetch } = useProducts()
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <PageHeader
        title="Products"
        action={
          <button onClick={() => setShowForm(true)} style={{ padding: '8px 16px', borderRadius: 8, background: '#95B1EE', border: 'none' }}>
            + Add Product
          </button>
        }
      />

      {showForm && (
        <div style={{ marginBottom: 24, padding: 16, border: '1px solid #eee', borderRadius: 12 }}>
          <AddProductForm
            onSuccess={() => {
              setShowForm(false)
              refetch()
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: 8 }}>Product</th>
              <th style={{ padding: 8 }}>Category</th>
              <th style={{ padding: 8 }}>Buy Price</th>
              <th style={{ padding: 8 }}>Sell Price</th>
              <th style={{ padding: 8 }}>Stock</th>
              <th style={{ padding: 8 }}>Unit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: 8 }}>{p.name}</td>
                <td style={{ padding: 8, textTransform: 'capitalize' }}>{p.category}</td>
                <td style={{ padding: 8 }}>Rp{p.purchase_price.toLocaleString('id-ID')}</td>
                <td style={{ padding: 8 }}>Rp{p.selling_price.toLocaleString('id-ID')}</td>
                <td style={{ padding: 8 }}>{p.stock}</td>
                <td style={{ padding: 8 }}>{p.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}