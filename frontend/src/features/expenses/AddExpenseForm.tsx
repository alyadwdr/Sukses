import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const categories = [
  'Belanja stok',
  'Listrik',
  'Air',
  'Internet',
  'Transportasi',
  'Gaji',
  'Sewa',
  'Peralatan',
  'Lainnya',
]

interface AddExpenseFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function AddExpenseForm({ onSuccess, onCancel }: AddExpenseFormProps) {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from('expenses').insert({
      description,
      category,
      amount: Number(amount),
      expense_date: expenseDate,
    })

    setSaving(false)
    if (!error) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 320 }}>
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
      />

      <input
        type="date"
        value={expenseDate}
        onChange={(e) => setExpenseDate(e.target.value)}
        required
        style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={onCancel} style={{ padding: 8, borderRadius: 6 }}>
          Cancel
        </button>
        <button type="submit" disabled={saving} style={{ padding: 8, borderRadius: 6, background: '#95B1EE', border: 'none' }}>
          {saving ? 'Saving...' : 'Save Expense'}
        </button>
      </div>
    </form>
  )
}