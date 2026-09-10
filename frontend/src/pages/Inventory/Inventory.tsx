import { useState } from 'react'
import { useProducts } from '@/features/products/useProducts'
import { useStockMovements } from '@/features/inventory/useStockMovements'
import StockInForm from '@/features/inventory/StockInForm'
import PageHeader from '@/components/PageHeader/PageHeader'
import Card from '@/components/Card/Card'

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
        <Card style={{ boxShadow: 'var(--shadow-card)', marginBottom: 24 }}>
          <StockInForm products={products} onSuccess={handleStockInSuccess} onCancel={() => setShowForm(false)} />
        </Card>
      )}

      {!showForm && (
        <>
          <h3 style={{ marginBottom: 12 }}>Current Stock</h3>
          <Card style={{ boxShadow: 'var(--shadow-card)', padding: 0, overflow: 'hidden', marginBottom: 32 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: 14 }}>Product</th>
                  <th style={{ padding: 14 }}>Category</th>
                  <th style={{ padding: 14 }}>Current Stock</th>
                  <th style={{ padding: 14 }}>Unit</th>
                  <th style={{ padding: 14 }}>Min. Stock</th>
                  <th style={{ padding: 14 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 14 }}>{p.name}</td>
                    <td style={{ padding: 14, textTransform: 'capitalize' }}>{p.category}</td>
                    <td style={{ padding: 14 }}>{p.stock}</td>
                    <td style={{ padding: 14 }}>{p.unit}</td>
                    <td style={{ padding: 14 }}>{p.min_stock}</td>
                    <td style={{ padding: 14 }}>
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
          </Card>

          <h3 style={{ marginBottom: 12 }}>Stock History</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Card style={{ boxShadow: 'var(--shadow-card)', padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: 14 }}>Date</th>
                    <th style={{ padding: 14 }}>Product</th>
                    <th style={{ padding: 14 }}>Change</th>
                    <th style={{ padding: 14 }}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 14 }}>{new Date(m.created_at).toLocaleDateString('id-ID')}</td>
                      <td style={{ padding: 14 }}>{m.products.name}</td>
                      <td style={{ padding: 14, color: m.change > 0 ? '#27ae60' : '#c0392b' }}>
                        {m.change > 0 ? '+' : ''}
                        {m.change} {m.products.unit}
                      </td>
                      <td style={{ padding: 14, textTransform: 'capitalize' }}>{m.reason.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </div>
  )
}