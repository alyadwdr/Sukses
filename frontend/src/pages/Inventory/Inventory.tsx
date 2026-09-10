import { useState } from 'react'
import { useProducts } from '@/features/products/useProducts'
import { useStockMovements } from '@/features/inventory/useStockMovements'
import StockInForm from '@/features/inventory/StockInForm'
import PageHeader from '@/components/PageHeader/PageHeader'

export default function Inventory() {
  const { products, refetch: refetchProducts } = useProducts()
  const { movements, loading, refetch: refetchMovements } = useStockMovements()
  const [showForm, setShowForm] = useState(false)

  function handleStockInSuccess() {
    setShowForm(false)
    refetchProducts()
    refetchMovements()
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        action={
          <button onClick={() => setShowForm(true)} style={{ padding: '8px 16px', borderRadius: 8, background: '#95B1EE', border: 'none' }}>
            + Stock In
          </button>
        }
        showFilter={!showForm}
      />

      {showForm && (
        <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 12, marginBottom: 24 }}>
          <StockInForm products={products} onSuccess={handleStockInSuccess} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {!showForm && (
        <>
          <h3 style={{ marginBottom: 12 }}>Current Stock</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: 8 }}>Product</th>
                <th style={{ padding: 8 }}>Category</th>
                <th style={{ padding: 8 }}>Current Stock</th>
                <th style={{ padding: 8 }}>Unit</th>
                <th style={{ padding: 8 }}>Min. Stock</th>
                <th style={{ padding: 8 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: 8 }}>{p.name}</td>
                  <td style={{ padding: 8, textTransform: 'capitalize' }}>{p.category}</td>
                  <td style={{ padding: 8 }}>{p.stock}</td>
                  <td style={{ padding: 8 }}>{p.unit}</td>
                  <td style={{ padding: 8 }}>{p.min_stock}</td>
                  <td style={{ padding: 8 }}>
                    <span
                      style={{
                        padding: '2px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        background: p.stock <= p.min_stock ? '#fde2e2' : '#e2f5e2',
                        color: p.stock <= p.min_stock ? '#c0392b' : '#27ae60',
                      }}
                    >
                      {p.stock <= p.min_stock ? 'Low' : 'Good'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ marginBottom: 12 }}>Stock History</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: 8 }}>Date</th>
                  <th style={{ padding: 8 }}>Product</th>
                  <th style={{ padding: 8 }}>Change</th>
                  <th style={{ padding: 8 }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: 8 }}>{new Date(m.created_at).toLocaleDateString('id-ID')}</td>
                    <td style={{ padding: 8 }}>{m.products.name}</td>
                    <td style={{ padding: 8, color: m.change > 0 ? '#27ae60' : '#c0392b' }}>
                      {m.change > 0 ? '+' : ''}
                      {m.change} {m.products.unit}
                    </td>
                    <td style={{ padding: 8, textTransform: 'capitalize' }}>{m.reason.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}