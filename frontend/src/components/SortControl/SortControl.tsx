import { useState } from 'react'
import { ArrowUpDown, ChevronDown, Check, ArrowUp, ArrowDown } from 'lucide-react'

export type SortField = 'name' | 'updated' | 'stock'
export type SortDirection = 'asc' | 'desc'

interface SortControlProps {
  field: SortField
  direction: SortDirection
  onFieldChange: (f: SortField) => void
  onDirectionChange: (d: SortDirection) => void
}

const fieldOptions: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Nama (Huruf)' },
  { value: 'updated', label: 'Update Terakhir' },
  { value: 'stock', label: 'Stok' },
]

export default function SortControl({ field, direction, onFieldChange, onDirectionChange }: SortControlProps) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            height: '100%',
            padding: '0 12px',
            borderRadius: 10,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-muted)',
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          <ArrowUpDown size={14} />
          <ChevronDown size={14} />
        </button>

        {open && (
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
              width: 180,
            }}
          >
            {fieldOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onFieldChange(opt.value)
                  setOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: field === opt.value ? 'var(--color-surface-muted)' : 'transparent',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  fontSize: 13,
                  textAlign: 'left',
                }}
              >
                {opt.label}
                {field === opt.value && <Check size={14} color="var(--color-primary-text)" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => onDirectionChange(direction === 'asc' ? 'desc' : 'asc')}
        aria-label={direction === 'asc' ? 'Urutan naik' : 'Urutan turun'}
        title={direction === 'asc' ? 'Ascending' : 'Descending'}
        style={{
          height: '100%',
          padding: '0 10px',
          borderRadius: 10,
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface-muted)',
          color: 'var(--color-text)',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        {direction === 'asc' ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
      </button>
    </div>
  )
}