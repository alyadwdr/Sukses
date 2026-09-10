import { useState } from 'react'
import { useExpenses } from '@/features/expenses/useExpenses'
import AddExpenseForm from '@/features/expenses/AddExpenseForm'

export default function Expenses() {
  const { expenses, loading, refetch } = useExpenses()
  const [showForm, setShowForm] = useState(false)

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: 'var(--color-text)' }}>Expenses</h1>
        <button onClick={() => setShowForm(true)} style={{ padding: '8px 16px', borderRadius: 8, background: '#95B1EE', border: 'none' }}>
          + Add Expense
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: 24, padding: 16, border: '1px solid #eee', borderRadius: 12 }}>
          <AddExpenseForm
            onSuccess={() => {
              setShowForm(false)
              refetch()
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {!showForm && (
        <>
          <div
            style={{
              background: 'var(--color-card)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              maxWidth: 280,
            }}
          >
            <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>Total Expenses</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>
              Rp{total.toLocaleString('id-ID')}
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: 8 }}>Date</th>
                  <th style={{ padding: 8 }}>Description</th>
                  <th style={{ padding: 8 }}>Category</th>
                  <th style={{ padding: 8 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: 8 }}>{new Date(e.expense_date).toLocaleDateString('id-ID')}</td>
                    <td style={{ padding: 8 }}>{e.description}</td>
                    <td style={{ padding: 8 }}>{e.category}</td>
                    <td style={{ padding: 8 }}>Rp{e.amount.toLocaleString('id-ID')}</td>
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