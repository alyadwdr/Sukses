import { useState } from 'react'
import { useProducts } from '@/features/products/useProducts'
import AddProductForm from '@/features/products/AddProductForm'
import PageHeader from '@/components/PageHeader/PageHeader'
import Card from '@/components/Card/Card'

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
        <Card style={{ boxShadow: 'var(--shadow-card)', marginBottom: 24 }}>
          <AddProductForm
            onSuccess={() => {
              setShowForm(false)
              refetch()
            }}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Card style={{ boxShadow: 'var(--shadow-card)', padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: 14 }}>Product</th>
                <th style={{ padding: 14 }}>Category</th>
                <th style={{ padding: 14 }}>Buy Price</th>
                <th style={{ padding: 14 }}>Sell Price</th>
                <th style={{ padding: 14 }}>Stock</th>
                <th style={{ padding: 14 }}>Unit</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 14 }}>{p.name}</td>
                  <td style={{ padding: 14, textTransform: 'capitalize' }}>{p.category}</td>
                  <td style={{ padding: 14 }}>Rp{p.purchase_price.toLocaleString('id-ID')}</td>
                  <td style={{ padding: 14 }}>Rp{p.selling_price.toLocaleString('id-ID')}</td>
                  <td style={{ padding: 14 }}>{p.stock}</td>
                  <td style={{ padding: 14 }}>{p.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}