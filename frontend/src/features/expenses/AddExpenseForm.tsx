import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { jakartaDateString } from '@/lib/time'
import type { Expense } from '@/types/expense'

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

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-muted)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
}

interface AddExpenseFormProps {
  expense?: Expense
  onSuccess: () => void
  onCancel: () => void
}

export default function AddExpenseForm({ expense, onSuccess, onCancel }: AddExpenseFormProps) {
  const [description, setDescription] = useState(expense?.description ?? '')
  const [category, setCategory] = useState(expense?.category ?? categories[0])
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '')
  const [expenseDate, setExpenseDate] = useState(expense?.expense_date ?? jakartaDateString())
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      description,
      category,
      amount: Number(amount),
      expense_date: expenseDate,
    }

    const { error } = expense
      ? await supabase.from('expenses').update(payload).eq('id', expense.id)
      : await supabase.from('expenses').insert(payload)

    setSaving(false)
    if (!error) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: 'var(--color-text)' }}>{expense ? 'Edit Pengeluaran' : 'Pengeluaran Baru'}</h2>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          placeholder="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={inputStyle}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Jumlah (Rp)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        style={{
          width: '100%',
          padding: 14,
          borderRadius: 10,
          border: 'none',
          background: 'var(--color-primary-solid)',
          color: 'var(--color-on-primary)',
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: 20,
        }}
      >
        {saving ? 'Menyimpan...' : expense ? 'Simpan Perubahan' : 'Simpan'}
      </button>
    </form>
  )
}