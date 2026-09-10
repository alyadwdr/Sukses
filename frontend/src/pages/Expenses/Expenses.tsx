import { useState } from 'react'
import { useExpenses } from '@/features/expenses/useExpenses'
import AddExpenseForm from '@/features/expenses/AddExpenseForm'
import Card from '@/components/Card/Card'

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
        <Card style={{ boxShadow: 'var(--shadow-card)', marginBottom: 24 }}>
          <AddExpenseForm
            onSuccess={() => {
              setShowForm(false)
              refetch()
            }}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      {!showForm && (
        <>
          <Card style={{ boxShadow: 'var(--shadow-card)', marginBottom: 24, maxWidth: 280 }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>Total Expenses</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>Rp{total.toLocaleString('id-ID')}</div>
          </Card>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <Card style={{ boxShadow: 'var(--shadow-card)', padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: 14 }}>Date</th>
                    <th style={{ padding: 14 }}>Description</th>
                    <th style={{ padding: 14 }}>Category</th>
                    <th style={{ padding: 14 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 14 }}>{new Date(e.expense_date).toLocaleDateString('id-ID')}</td>
                      <td style={{ padding: 14 }}>{e.description}</td>
                      <td style={{ padding: 14 }}>{e.category}</td>
                      <td style={{ padding: 14 }}>Rp{e.amount.toLocaleString('id-ID')}</td>
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